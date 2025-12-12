import request from "supertest";
import { jest } from "@jest/globals";
import { connectMemoryDB, stopMemoryDB, clearDB } from "../setup-mongo.js";
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import app from "../../index.js";
import CartProductModel from "../../models/cartproduct.model.js";
import UserModel from "../../models/user.model.js";
import Stripe from "stripe";

jest.mock("../../middleware/auth.js", () => ({
  __esModule: true,
  default: (req, res, next) => {
    req.userId = "mockUserId";
    next();
  },
}));

jest.mock("../../middleware/Admin.js", () => (req, res, next) => next());

jest.mock("../../config/stripe.js", () => {
  return {
    __esModule: true,
    default: {
      webhooks: {
        constructEvent: jest.fn(() => ({
          type: "checkout.session.completed",
          data: {
            object: {
              id: "session_123",
              metadata: { userId: "user1", addressId: "addr1" },
            },
          },
        })),
      },
      checkout: {
        sessions: {
          listLineItems: jest.fn().mockResolvedValue({
            data: [
              {
                quantity: 1,
                price: { product: "prod123" },
              },
            ],
          }),
        },
      },
      products: {
        retrieve: jest.fn().mockResolvedValue({
          name: "Producto Test",
          images: ["image1.jpg"],
          metadata: { productId: "prod123" },
        }),
      },
    },
  };
});
const productId = new mongoose.Types.ObjectId();
describe("Cart Controller", () => {
  let userToken;
  let userId;
  beforeAll(async () => {
    await connectMemoryDB();
  });

  beforeAll(async () => {
    userToken = await createAdminAndLogin();
    const user = await UserModel.findOne({ email: "admin@test.com" });
    userId = user._id;
  });

  afterEach(async () => {
    await clearDB();
  });

  afterAll(async () => {
    await stopMemoryDB();
  });

  afterEach(async () => {
    await CartProductModel.deleteMany({ userId });
    await UserModel.updateOne({ _id: userId }, { shopping_cart: [] });
  });

  //create
  test("Debe agregar un producto correctamente", async () => {
    jest.spyOn(Stripe.webhooks, "constructEvent").mockImplementation(() => {
      return {
        type: "checkout.session.completed",
        data: {
          object: {
            id: "session_123",
            metadata: { userId: "user1", addressId: "addr1" },
          },
        },
      };
    });

    const res = await request(app)
      .post("/api/cart/create")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ productId });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Producto se añadio al carrito");
    expect(res.body.data.productId).toBe(String(productId));
    expect(res.body.data.userId).toBe(String(userId));
  });

  test("Debe retornar 400 si no se provee productId", async () => {
    const res = await request(app)
      .post("/api/cart/create")
      .set("Authorization", `Bearer ${userToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(true);
    expect(res.body.message).toBe("Provea un id de producto");
  });

  test("Debe retornar 500 si hay un fallo en la BD", async () => {
    const token = await createAdminAndLogin();

    jest
      .spyOn(CartProductModel.prototype, "save")
      .mockRejectedValue(new Error("Fallo DB"));

    const res = await request(app)
      .post("/api/cart/create")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId: new mongoose.Types.ObjectId() });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe(true);
    expect(res.body.message).toContain("Fallo DB");

    CartProductModel.prototype.save.mockRestore();
  });

  //get

  test("Debe retornar los items del carrito correctamente", async () => {
    jest.spyOn(Stripe.webhooks, "constructEvent").mockImplementation(() => {
      return {
        type: "checkout.session.completed",
        data: {
          object: {
            id: "session_123",
            metadata: { userId: "user1", addressId: "addr1" },
          },
        },
      };
    });
    const userId = new mongoose.Types.ObjectId();
    const productId = new mongoose.Types.ObjectId();

    await CartProductModel.create({ userId, productId, quantity: 2 });

    const token = await createAdminAndLogin();
    const res = await request(app)
      .get("/api/cart/get")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.error).toBe(false);
  });

  //update-qty

  test("Debe actualizar la cantidad del carrito correctamente", async () => {
    const cartItem = await CartProductModel.create({
      userId: new mongoose.Types.ObjectId(),
      productId: new mongoose.Types.ObjectId(),
      quantity: 1,
    });

    const token = await createAdminAndLogin();

    const res = await request(app)
      .put("/api/cart/update-qty")
      .set("Authorization", `Bearer ${token}`)
      .send({
        _id: cartItem._id,
        qty: 5,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Carrito actualizado");
  });

  test("Debe retornar 400 si no se envía _id o qty", async () => {
    const token = await createAdminAndLogin();

    const res = await request(app)
      .put("/api/cart/update-qty")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("provide _id, qty");
  });

  test("Debe retornar 500 si ocurre un error en la DB", async () => {
    jest
      .spyOn(CartProductModel, "updateOne")
      .mockRejectedValue(new Error("Fallo DB"));

    const token = await createAdminAndLogin();

    const res = await request(app)
      .put("/api/cart/update-qty")
      .set("Authorization", `Bearer ${token}`)
      .send({
        _id: new mongoose.Types.ObjectId(),
        qty: 3,
      });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(true);
    expect(res.body.message).toContain("Fallo DB");
  });

  //delete

  test("Debe eliminar un producto del carrito correctamente", async () => {
    const userId = new mongoose.Types.ObjectId();
    const cartItem = await CartProductModel.create({
      userId,
      productId: new mongoose.Types.ObjectId(),
      quantity: 2,
    });

    const token = await createAdminAndLogin();

    const res = await request(app)
      .delete("/api/cart/delete-cart-item")
      .set("Authorization", `Bearer ${token}`)
      .send({ _id: cartItem._id });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.error).toBe(false);
    expect(res.body.message).toBe("Producto eliminado");
  });

  test("Debe retornar 400 si no se envía _id", async () => {
    const token = await createAdminAndLogin();

    const res = await request(app)
      .delete("/api/cart/delete-cart-item")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(true);
    expect(res.body.message).toBe("Provide _id");
  });

  test("Debe retornar 500 si ocurre un error en la DB", async () => {
    jest
      .spyOn(CartProductModel, "deleteOne")
      .mockRejectedValue(new Error("Fallo DB"));

    const token = await createAdminAndLogin();

    const res = await request(app)
      .delete("/api/cart/delete-cart-item")
      .set("Authorization", `Bearer ${token}`)
      .send({ _id: new mongoose.Types.ObjectId() });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(true);
    expect(res.body.message).toContain("Fallo DB");
  });
});

export const createAdminAndLogin = async () => {
  // 1. Crear admin si no existe
  const password = await bcryptjs.hash("123456", 10);

  await UserModel.findOneAndUpdate(
    { email: "admin@test.com" },
    {
      name: "Admin",
      email: "admin@test.com",
      password,
      role: "ADMIN",
      status: "Active",
    },
    { upsert: true, new: true }
  );

  const loginRes = await request(app)
    .post("/api/user/login")
    .send({ email: "admin@test.com", password: "123456" });

  return loginRes.body.data.accesstoken;
};
