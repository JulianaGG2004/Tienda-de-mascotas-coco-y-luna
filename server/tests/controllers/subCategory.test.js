import request from "supertest";
import { jest } from "@jest/globals";
import { connectMemoryDB, stopMemoryDB, clearDB } from "../setup-mongo.js";
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import app from "../../index.js";
import SubCategoryModel from "../../models/subCategory.model.js";
import UserModel from "../../models/user.model.js";

jest.mock("../../middleware/auth.js", () => ({
  __esModule: true,
  default: (req, res, next) => {
    req.userId = "mockUserId";
    next();
  },
}));
jest.mock("../../middleware/Admin.js", () => (req, res, next) => next());

describe("Cart Controller", () => {
  beforeAll(async () => {
    await connectMemoryDB();
  });

  afterEach(async () => {
    await clearDB();
  });

  afterAll(async () => {
    await stopMemoryDB();
  });
  //create
  test("Debe crear una subcategoría correctamente", async () => {
    const token = await createAdminAndLogin();

    const res = await request(app)
      .post("/api/subcategory/create")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "SubCat Prueba",
        image: "imagen.jpg",
        category: [new mongoose.Types.ObjectId()],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.error).toBe(false);
    expect(res.body.message).toBe("Subcategoría regitrada exitosamente");
    expect(res.body.data.name).toBe("SubCat Prueba");
    expect(res.body.data.image).toBe("imagen.jpg");
    expect(res.body.data.category.length).toBe(1);
  });

  test("Debe retornar 400 si no se envían campos requeridos", async () => {
    const token = await createAdminAndLogin();

    const res = await request(app)
      .post("/api/subcategory/create")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(true);
    expect(res.body.message).toBe("Ingrese nombre, imagen y categorias");
  });

  test("Debe retornar 500 si ocurre un error en la DB", async () => {
    const token = await createAdminAndLogin();

    jest
      .spyOn(SubCategoryModel.prototype, "save")
      .mockRejectedValue(new Error("Fallo DB"));

    const res = await request(app)
      .post("/api/subcategory/create")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "SubCat Prueba",
        image: "imagen.jpg",
        category: [new mongoose.Types.ObjectId()],
      });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(true);
    expect(res.body.message).toContain("Fallo DB");

    SubCategoryModel.prototype.save.mockRestore();
  });

  //get

  test("Debe retornar 200 y la lista de subcategorías", async () => {
    const subCategory = await SubCategoryModel.create({
      name: "SubCat Test",
      image: "image.png",
      category: [],
    });

    const res = await request(app).post("/api/subcategory/get");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.error).toBe(false);
    expect(res.body.message).toBe("Información de subcategorías");
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].name).toBe("SubCat Test");
  });

  test("Debe retornar 500 si ocurre un error en la DB", async () => {
    jest.spyOn(SubCategoryModel, "find").mockImplementation(() => {
      return {
        sort: () => {
          throw new Error("Fallo DB");
        },
        populate: () => {},
      };
    });
    const res = await request(app).post("/api/subcategory/get");

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(true);
    expect(res.body.message).toContain("Fallo DB");
  });

  // update

  test("Debe actualizar una subcategoría correctamente", async () => {
    const subCategory = await SubCategoryModel.create({
      name: "Test",
      image: "img.png",
      category: [new mongoose.Types.ObjectId()],
    });

    const token = await createAdminAndLogin();

    const res = await request(app)
      .put("/api/subcategory/update")
      .set("Authorization", `Bearer ${token}`)
      .send({
        _id: subCategory._id,
        name: "Nuevo nombre",
        image: "nueva-img.png",
        category: subCategory.category,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.error).toBe(false);
    expect(res.body.message).toBe("Subcategoría actualizada exitosamente");
  });

  test("Debe retornar 400 si faltan campos requeridos", async () => {
    const token = await createAdminAndLogin();

    const res = await request(app)
      .put("/api/subcategory/update")
      .set("Authorization", `Bearer ${token}`)
      .send({
        _id: "123",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(true);
    expect(res.body.message).toBe("Ingrese nombre, imagen y categoria");
  });

  test("Debe retornar 400 si el _id no existe", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const token = await createAdminAndLogin();
    const res = await request(app)
      .put("/api/subcategory/update")
      .set("Authorization", `Bearer ${token}`)
      .send({
        _id: fakeId,
        name: "Test",
        image: "img.png",
        category: [new mongoose.Types.ObjectId()],
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(true);
    expect(res.body.message).toBe("Revisa tu _id");
  });

  test("Debe retornar 500 si ocurre un error en la DB", async () => {
    jest
      .spyOn(SubCategoryModel, "findById")
      .mockRejectedValue(new Error("Fallo DB"));

    const token = await createAdminAndLogin();
    const res = await request(app)
      .put("/api/subcategory/update")
      .set("Authorization", `Bearer ${token}`)
      .send({
        _id: new mongoose.Types.ObjectId(),
        name: "Test",
        image: "img.png",
        category: [new mongoose.Types.ObjectId()],
      });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(true);
    expect(res.body.message).toContain("Fallo DB");

    SubCategoryModel.findById.mockRestore();
  });

  //delete

  test("Debe eliminar una subcategoría correctamente", async () => {
    const subCategory = await SubCategoryModel.create({
        name: "Test",
        image: "img.png",
        category: [new mongoose.Types.ObjectId()]
    });

    const token = await createAdminAndLogin();
    const res = await request(app)
      .delete("/api/subcategory/delete")
      .set("Authorization", `Bearer ${token}`)
        .send({ _id: subCategory._id });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.error).toBe(false);
    expect(res.body.message).toBe("Subcategoría eliminada exitosamente");
    expect(res.body.data._id.toString()).toBe(subCategory._id.toString());
});

test("Debe retornar 500 si ocurre un error en la DB", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    jest.spyOn(SubCategoryModel, "findByIdAndDelete").mockRejectedValue(new Error("Fallo DB"));

    const token = await createAdminAndLogin();
    const res = await request(app)
      .delete("/api/subcategory/delete")
      .set("Authorization", `Bearer ${token}`)
        .send({ _id: fakeId });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(true);
    expect(res.body.message).toContain("Fallo DB");

    SubCategoryModel.findByIdAndDelete.mockRestore();
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
