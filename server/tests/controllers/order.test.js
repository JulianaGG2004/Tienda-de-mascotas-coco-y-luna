import request from "supertest";
import { jest } from "@jest/globals";
import { connectMemoryDB, stopMemoryDB, clearDB } from "../setup-mongo.js";
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import app from "../../index.js";
import UserModel from "../../models/user.model.js";
import OrderModel from "../../models/order.model.js";
import CartProductModel from "../../models/cartproduct.model.js";
import Stripe from "../../config/stripe.js";

jest.mock("../../middleware/auth.js", () => ({
  __esModule: true,
  default: (req, res, next) => {
    req.userId = "mockUserId";
    next();
  },
}));

jest.mock("../../middleware/Admin.js", () => (req, res, next) => next());
jest.spyOn(OrderModel.prototype, "save");
describe("Order Controller", () => {
  beforeAll(async () => {
    await connectMemoryDB();
  });

  afterEach(async () => {
    await clearDB();
  });

  afterAll(async () => {
    await stopMemoryDB();
  });
  //cash-on-delivery
  test("Debe crear un pedido con éxito", async () => {
    const userId = "user123";
    app.use((req, res, next) => {
      req.userId = userId;
      next();
    });

    const mockOrder = {
      _id: "order123",
      userId,
      orderId: "ORD-123456",
      products: [],
      totalAmt: 100,
      subTotalAmt: 90,
      delivery_address: "address123",
    };

    jest.spyOn(OrderModel, "create").mockResolvedValue(mockOrder);
    jest.spyOn(CartProductModel, "deleteMany").mockResolvedValue({});
    jest.spyOn(UserModel, "updateOne").mockResolvedValue({});
    const token = await createAdminAndLogin();
    const res = await request(app)
      .post("/api/order/cash-on-delivery")
      .set("Authorization", `Bearer ${token}`)
      .send({
        list_items: [
          {
            productId: { _id: "p1", name: "Prod 1", image: [] },
            quantity: 1,
          },
        ],
        totalAmt: 100,
        subTotalAmt: 90,
        addressId: "address123",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("¡Pedido realizado con éxito!");
    expect(res.body.data).toEqual(mockOrder);
  });

  test("Debe retornar 500 si ocurre un error en la BD", async () => {
    const userId = "user123";

    app.use((req, res, next) => {
      req.userId = userId;
      next();
    });

    jest.spyOn(OrderModel, "create").mockRejectedValue(new Error("Fallo DB"));
    const token = await createAdminAndLogin();
    const res = await request(app)
      .post("/api/order/cash-on-delivery")
      .set("Authorization", `Bearer ${token}`)
      .send({
        list_items: [
          {
            productId: { _id: "p1", name: "Prod 1", image: [] },
            quantity: 1,
          },
        ],
        totalAmt: 100,
        subTotalAmt: 90,
        addressId: "address123",
      });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(true);
    expect(res.body.message).toContain("Fallo DB");
  });

  //checkout

  //webhook
  test("Debe retornar 400 si la firma de Stripe es inválida", async () => {
    jest.spyOn(Stripe.webhooks, "constructEvent").mockImplementation(() => {
      throw new Error("Firma inválida");
    });

    const res = await request(app)
      .post("/api/order/webhook")
      .set("stripe-signature", "firma_invalida")
      .send({});

    expect(res.status).toBe(400);
    expect(res.text).toContain("Webhook Error: Firma inválida");
  });

  test("Debe procesar correctamente checkout.session.completed", async () => {
    jest.spyOn(Stripe.webhooks, "constructEvent").mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          id: "session123",
          amount_total: 50000,
          amount_subtotal: 45000,
          payment_intent: "pi_123",
          metadata: {
            userId: "user123",
            addressId: "addr123",
          },
        },
      },
    });
    jest.spyOn(Stripe.checkout.sessions, "listLineItems").mockResolvedValue({
      data: [
        {
          quantity: 2,
          price: { product: "prod123" },
        },
      ],
    });
    jest.spyOn(Stripe.products, "retrieve").mockResolvedValue({
      metadata: { productId: "p123" },
      name: "Producto test",
      images: ["img.png"],
    });
    jest.spyOn(OrderModel, "create").mockResolvedValue({});
    jest.spyOn(CartProductModel, "deleteMany").mockResolvedValue({});
    jest.spyOn(UserModel, "updateOne").mockResolvedValue({});

    const res = await request(app)
      .post("/api/order/webhook")
      .set("stripe-signature", "firma_valida")
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);
  });

  //order-list

  test("Debe retornar todos los pedidos si el usuario es ADMIN", async () => {
    const tokenUserId = "admin123";

    UserModel.findById = jest.fn().mockResolvedValue({
      _id: tokenUserId,
      role: "ADMIN",
    });

    const mockPopulate2 = jest.fn().mockResolvedValue([{ orderId: "ORD-1" }]);

    const mockPopulate1 = jest.fn(() => ({ populate: mockPopulate2 }));

    const mockSort = jest.fn(() => ({ populate: mockPopulate1 }));

    OrderModel.find = jest.fn(() => ({ sort: mockSort }));

    const token = await createAdminAndLogin();
    const res = await request(app)
      .get("/api/order/order-list")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.message).toBe("Lista de pedidos");
  });

  test("Debe retornar solo los pedidos del usuario si es USER", async () => {
    const tokenUserId = "user123";

    // Mock usuario normal
    UserModel.findById = jest.fn().mockResolvedValue({
      _id: tokenUserId,
      role: "USER",
    });

    const mockPopulate = jest
      .fn()
      .mockResolvedValue([{ orderId: "ORD-7", userId: tokenUserId }]);

    const mockSort = jest.fn(() => ({ populate: mockPopulate }));

    OrderModel.find = jest.fn(() => ({ sort: mockSort }));
    const token = await createUserAndLogin();
    const res = await request(app)
      .get("/api/order/order-list")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].orderId).toBe("ORD-7");
  });

  test("Debe retornar 500 si falla la BD", async () => {
    UserModel.findById = jest.fn().mockRejectedValue(new Error("Fallo DB"));
    const token = await createAdminAndLogin();
    const res = await request(app)
      .get("/api/order/order-list")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe(true);
    expect(res.body.message).toContain("Fallo DB");
  });

  //status

  test("Debe actualizar el estado y retornar 200 en escenario exitoso", async () => {
    const tokenUserId = "admin123";

    UserModel.findById = jest.fn().mockResolvedValue({
      _id: tokenUserId,
      role: "ADMIN",
    });
    const fakeOrder = {
      _id: "order123",
      status: "Procesando",
    };

    jest.spyOn(OrderModel, "findByIdAndUpdate").mockResolvedValue(fakeOrder);
    const token = await createAdminAndLogin();
    const res = await request(app)
      .put("/api/order/status")
      .set("Authorization", `Bearer ${token}`)
      .send({
        orderId: "order123",
        status: "Procesando",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(fakeOrder);
    expect(res.body.message).toBe("Estado actualizado");
  });

  test("Debe retornar 400 si el estado no es válido", async () => {
    const tokenUserId = "admin123";

    UserModel.findById = jest.fn().mockResolvedValue({
      _id: tokenUserId,
      role: "ADMIN",
    });

    const token = await createAdminAndLogin();
    const res = await request(app)
      .put("/api/order/status")
      .set("Authorization", `Bearer ${token}`)
      .send({
        orderId: "123",
        status: "Cancelado",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(true);
    expect(res.body.message).toBe("Estado no válido");
  });

  test("Debe retornar 500 si ocurre un error en la BD", async () => {
    jest
      .spyOn(OrderModel, "findByIdAndUpdate")
      .mockRejectedValue(new Error("Fallo DB"));

    const tokenUserId = "admin123";

    UserModel.findById = jest.fn().mockResolvedValue({
      _id: tokenUserId,
      role: "ADMIN",
    });

    const token = await createAdminAndLogin();
    const res = await request(app)
      .put("/api/order/status")
      .set("Authorization", `Bearer ${token}`)
      .send({
        orderId: "order123",
        status: "Enviado",
      });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
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

  // 2. Login para obtener token
  const loginRes = await request(app)
    .post("/api/user/login")
    .send({ email: "admin@test.com", password: "123456" });

  return loginRes.body.data.accesstoken;
};

export const createUserAndLogin = async () => {
  // 1. Crear admin si no existe
  const password = await bcryptjs.hash("123456", 10);

  await UserModel.findOneAndUpdate(
    { email: "user@test.com" },
    {
      name: "user",
      email: "user@test.com",
      password,
      role: "USER",
      status: "Active",
    },
    { upsert: true, new: true }
  );

  // 2. Login para obtener token
  const loginRes = await request(app)
    .post("/api/user/login")
    .send({ email: "user@test.com", password: "123456" });

  return loginRes.body.data.accesstoken;
};
