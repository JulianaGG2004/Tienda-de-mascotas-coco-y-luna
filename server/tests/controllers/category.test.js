import request from "supertest";
import { jest } from "@jest/globals";
import { connectMemoryDB, stopMemoryDB, clearDB } from "../setup-mongo.js";
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import app from "../../index.js";
import CategoryModel from "../../models/category.model.js";
import SubCategoryModel from "../../models/subCategory.model.js";
import ProductModel from "../../models/product.model.js";
import UserModel from "../../models/user.model.js";

jest.mock("../../middleware/auth.js", () => ({
  __esModule: true,
  default: (req, res, next) => {
    req.userId = "mockUserId";
  },
}));

jest.mock("../../middleware/Admin.js", () => (req, res, next) => next());

describe("Category Controller", () => {
  beforeAll(async () => {
    await connectMemoryDB();
  });

  afterEach(async () => {
    await clearDB();
  });

  afterAll(async () => {
    await stopMemoryDB();
  });

  //add-category
  test("Debe registrar la categoría correctamente (200)", async () => {
    const mockCategory = { _id: "123", name: "Cat1", image: "img.jpg" };
    jest.spyOn(CategoryModel.prototype, "save").mockResolvedValue(mockCategory);

    const token = await createAdminAndLogin();

    const res = await request(app)
      .post("/api/category/add-category")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Cat1", image: "img.jpg" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.error).toBe(false);
    expect(res.body.message).toBe("Categoría registrada exitosamente");
    expect(res.body.data).toEqual(mockCategory);
  });

  test("Debe retornar 400 si faltan parámetros", async () => {
    const token = await createAdminAndLogin();

    const res = await request(app)
      .post("/api/category/add-category")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "", image: "" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(true);
    expect(res.body.message).toBe("Ingrese los parametros requeridos.");
  });

  test("Debe retornar 500 si ocurre un error en la DB", async () => {
    jest
      .spyOn(CategoryModel.prototype, "save")
      .mockRejectedValue(new Error("Fallo DB"));

    const token = await createAdminAndLogin();

    const res = await request(app)
      .post("/api/category/add-category")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Cat1", image: "img.jpg" });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(true);
    expect(res.body.message).toBe("Fallo DB");
  });

  test("Debe retornar 500 si save devuelve null", async () => {
    jest.spyOn(CategoryModel.prototype, "save").mockResolvedValue(null);

    const token = await createAdminAndLogin();

    const res = await request(app)
      .post("/api/category/add-category")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Cat1", image: "img.jpg" });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(true);
    expect(res.body.message).toBe("Hubo un error al crear la Categoría");
  });

  //get
test("Debe retornar la lista de categorías correctamente (200)", async () => {
    const mockCategories = [
      { _id: "1", name: "Cat1", image: "img1.jpg" },
      { _id: "2", name: "Cat2", image: "img2.jpg" }
    ];

    jest.spyOn(CategoryModel, "find").mockResolvedValue(mockCategories);

    const res = await request(app)
      .get("/api/category/get");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.error).toBe(false);
    expect(res.body.data).toEqual(mockCategories);
  });

  test("Debe retornar 500 si ocurre un error en la DB", async () => {
    jest.spyOn(CategoryModel, "find").mockRejectedValue(new Error("Fallo DB"));

    const res = await request(app)
      .get("/api/category/get");

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(true);
    expect(res.body.message).toBe("Fallo DB");
  });
  //update
test("Debe actualizar la categoría correctamente (200)", async () => {
    const mockUpdateResult = { acknowledged: true, modifiedCount: 1 };
    
    jest.spyOn(CategoryModel, "updateOne").mockResolvedValue(mockUpdateResult);
    const token = await createAdminAndLogin();
    const res = await request(app)
      .put("/api/category/update")
      .set("Authorization", `Bearer ${token}`)
      .send({
        _id: "64f1b5e1d2c123456789abcd",
        name: "Categoría Actualizada",
        image: "imagen.jpg"
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.error).toBe(false);
    expect(res.body.message).toBe("Categoría actualizada exitosamente");
    expect(res.body.data).toEqual(mockUpdateResult);
  });

  test("Debe retornar 500 si ocurre un error en la DB", async () => {
    jest.spyOn(CategoryModel, "updateOne").mockRejectedValue(new Error("Fallo DB"));
    const token = await createAdminAndLogin();
    const res = await request(app)
      .put("/api/category/update")
      .set("Authorization", `Bearer ${token}`)
      .send({
        _id: "64f1b5e1d2c123456789abcd",
        name: "Categoría Actualizada",
        image: "imagen.jpg"
      });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(true);
    expect(res.body.message).toBe("Fallo DB");
  });
  //delete

  test("Debe eliminar la categoría correctamente (200)", async () => {
    jest.spyOn(SubCategoryModel, "find").mockReturnValue({
      countDocuments: jest.fn().mockResolvedValue(0)
    });
    jest.spyOn(ProductModel, "find").mockReturnValue({
      countDocuments: jest.fn().mockResolvedValue(0)
    });
    const mockDeleteResult = { acknowledged: true, deletedCount: 1 };
    jest.spyOn(CategoryModel, "deleteOne").mockResolvedValue(mockDeleteResult);
    const token = await createAdminAndLogin();
    const res = await request(app)
      .delete("/api/category/delete")
      .set("Authorization", `Bearer ${token}`)
      .send({ _id: "64f1b5e1d2c123456789abcd" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.error).toBe(false);
    expect(res.body.message).toBe("Categoría eliminada correctamente");
    expect(res.body.data).toEqual(mockDeleteResult);
  });

  test("Debe retornar 400 si la categoría está siendo utilizada", async () => {
    jest.spyOn(SubCategoryModel, "find").mockReturnValue({
      countDocuments: jest.fn().mockResolvedValue(2)
    });
    jest.spyOn(ProductModel, "find").mockReturnValue({
      countDocuments: jest.fn().mockResolvedValue(0)
    });

    const token = await createAdminAndLogin();
    const res = await request(app)
      .delete("/api/category/delete")
      .set("Authorization", `Bearer ${token}`)
      .send({ _id: "64f1b5e1d2c123456789abcd" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(true);
    expect(res.body.message).toBe("La categoría esta siendo utilizada, no se puede eliminar");
  });

  test("Debe retornar 500 si ocurre un error en la DB", async () => {
    jest.spyOn(SubCategoryModel, "find").mockImplementation(() => { throw new Error("Fallo DB") });

    const token = await createAdminAndLogin();
    const res = await request(app)
      .delete("/api/category/delete")
      .set("Authorization", `Bearer ${token}`)
      .send({ _id: "64f1b5e1d2c123456789abcd" });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(true);
    expect(res.body.message).toBe("Fallo DB");
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
