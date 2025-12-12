import request from "supertest";
import { jest } from "@jest/globals";
import { connectMemoryDB, stopMemoryDB, clearDB } from "../setup-mongo.js";
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import app from "../../index.js";
import ProductModel from "../../models/product.model.js";
import UserModel from "../../models/user.model.js";

jest.mock("../../middleware/auth.js", () => ({
  __esModule: true,
  default: (req, res, next) => {
    req.userId = "mockUserId"; // simula usuario autenticado
    next();
  },
}));

jest.mock("../../middleware/Admin.js", () => (req, res, next) => next());
jest.spyOn(ProductModel.prototype, "save");
describe("Product Controller", () => {

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
  test("Debe crear un producto exitosamente", async () => {

    ProductModel.prototype.save.mockResolvedValue({
      _id: "mockProductId",
      name: "Producto Test",
      image: ["img1.jpg"],
      category: ["cat123"],
      subCategory: ["subcat123"],
      unit: "Unidad",
      stock: 10,
      status: true,
      price: 100,
      description: "Descripcion test",
    });
    const token = await createAdminAndLogin();
    const res = await request(app)
      .post("/api/product/create")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Producto Test",
        image: ["img1.jpg"],
        category: ["cat123"],
        subCategory: ["subcat123"],
        unit: "Unidad",
        stock: 10,
        status: true,
        price: 100,
        description: "Descripcion test",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Producto registrado exitosamente");
    expect(res.body.data).toHaveProperty("_id", "mockProductId");
  });

  test("Se crea un producto pero no envia todos los campos obligatorios", async () => {
    const token = await createAdminAndLogin();
    const res = await request(app)
      .post("/api/product/create")
      .set("Authorization", `Bearer ${token}`)
      .send({
        price: 100,
        description: "Descripcion test",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Ingrese los campos requeridos");
  });

  test("Se crea un producto pero hubo un error en la DB error 500", async () => {
    const productData = {
        name: "Producto Test",
        image: ["img.png"],
        category: ["65acd29f9e7b2c347a7f7e91"],
        subCategory: ["65acd29f9e7b2c347a7f7e92"],
        unit: "Kg",
        stock: 10,
        status: true,
        price: 20000,
        description: "Producto de prueba"
    };

     jest.spyOn(ProductModel.prototype, "save")
      .mockRejectedValue(new Error("Error interno DB"));
    const token = await createAdminAndLogin();
    const res = await request(app)
      .post("/api/product/create")
      .set("Authorization", `Bearer ${token}`)
      .send(productData);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Error interno DB");
  });

//get

    test("Debe listar productos exitosamente", async () => {

    await ProductModel.create([
        {
        name: "Producto A",
        image: ["img1.jpg"],
        category: [],
        subCategory: [],
        unit: "kg",
        stock: 10,
        price: 100,
        description: "desc A",
        },
        {
        name: "Producto B",
        image: ["img2.jpg"],
        category: [],
        subCategory: [],
        unit: "kg",
        stock: 20,
        price: 200,
        description: "desc B",
        }
    ]);

    const res = await request(app)
        .post("/api/product/get")
        .send({ page: 1, limit: 10 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.message).toBe("Listado de productos");
    expect(res.body.totalCount).toBe(2);
    expect(res.body.totalNoPage).toBe(1);
    });

    test("Debe retornar error 500 si falla la búsqueda de productos", async () => {
    const error = new Error("Fallo en DB");
    jest.spyOn(ProductModel, "find").mockReturnValue({
        sort: () => ({
        skip: () => ({
            limit: () => ({
            populate: () => Promise.reject(error)
            })
        })
        })
    });
    jest.spyOn(ProductModel, "countDocuments").mockResolvedValue(0);

    const res = await request(app)
        .post("/api/product/get")
        .send({ page: 1, limit: 10 });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(true);
    expect(res.body.message).toContain("Fallo en DB");
    });

    test("Debe usar page=1 y limit=10 cuando no se envían", async () => {
    const mockFind = jest.spyOn(ProductModel, "find").mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue([]),
    });

    const mockCount = jest.spyOn(ProductModel, "countDocuments").mockResolvedValue(0);

    const res = await request(app)
        .post("/api/product/get")
        .send({});

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockFind().skip).toHaveBeenCalledWith(0);
    expect(mockFind().limit).toHaveBeenCalledWith(10);
    });

//get-product-by-category

    test("Debe obtener productos por categoría correctamente", async () => {
    const categoryId = new mongoose.Types.ObjectId();

    await ProductModel.create({
        name: "Producto 1",
        image: ["img.jpg"],
        category: [categoryId],
        subCategory: [],
        unit: "kg",
        price: 10,
        description: "desc",
    });

    const res = await request(app)
        .post("/api/product/get-product-by-category")
        .send({ id: categoryId.toString() });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Lista de productos por categoría");
    });

    test("Debe retornar 400 si no se envía el id de la categoría", async () => {
    const res = await request(app)
        .post("/api/product/get-product-by-category")
        .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(true);
    expect(res.body.message).toBe("Provea el id de la categoría");
    });

    test("Debe retornar 500 si hay un fallo interno en la base de datos", async () => {
    jest.spyOn(ProductModel, "find").mockImplementation(() => {
        throw new Error("Fallo DB");
    });

    const res = await request(app)
        .post("/api/product/get-product-by-category")
        .send({ id: ["123"] });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(true);
    expect(res.body.message).toContain("Fallo DB");
    });


//get-product-by-category-and-subcategory
    test("Debe listar productos por categoría y subcategoría (200)", async () => {

    const mockData = [{ name: "Producto Test", price: 100 }];

    ProductModel.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockData)
        })
        })
    });

    ProductModel.countDocuments = jest.fn().mockResolvedValue(1);

    const res = await request(app)
        .post("/api/product/get-product-by-category-and-subcategory")
        .send({
        categoryId: ["cat123"],
        subCategoryId: ["sub123"],
        page: 1,
        limit: 10,
        });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.error).toBe(false);
    expect(res.body.message).toBe("Lista de productos");
    expect(res.body.data.length).toBe(1);
    expect(res.body.totalCount).toBe(1);
    });

    test("Debe retornar 400 si faltan categoryId o subCategoryId", async () => {
    const res = await request(app)
        .post("/api/product/get-product-by-category-and-subcategory")
        .send({ categoryId: ["123"] });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(true);
    expect(res.body.message).toBe("Brinde una categoría y subcategoría");
    });

    test("Debe retornar 500 si ocurre un error en la BD", async () => {
        ProductModel.find = jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
                skip: jest.fn().mockReturnValue({
                    limit: jest.fn().mockRejectedValue(new Error("Fallo DB"))
                })
            })
        });
        ProductModel.countDocuments = jest.fn();
        const res = await request(app)
            .post("/api/product/get-product-by-category-and-subcategory")
            .send({
                categoryId: ["cat1"],
                subCategoryId: ["sub1"],
                page: 1,
                limit: 10
            });
        expect(res.status).toBe(500);
        expect(res.body.error).toBe(true);
        expect(res.body.message).toContain("Fallo DB");
    });

//get-product-details

    test("Debe obtener los detalles de un producto (200)", async () => {
    const fakeProduct = { _id: "abc123", name: "Producto test" };

    jest.spyOn(ProductModel, "findOne").mockResolvedValue(fakeProduct);

    const res = await request(app)
        .post("/api/product/get-product-details")
        .send({ productId: "abc123" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.error).toBe(false);
    expect(res.body.message).toBe("product details");
    expect(res.body.data).toEqual(fakeProduct);
    });

    test("Debe retornar 500 si ocurre un error en la BD", async () => {
    jest.spyOn(ProductModel, "findOne")
        .mockRejectedValue(new Error("Fallo DB"));

    const res = await request(app)
        .post("/api/product/get-product-details")
        .send({ productId: "abc123" });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(true);
    expect(res.body.message).toContain("Fallo DB");
    });

//update-product-details

test("Debe actualizar el producto correctamente", async () => {

  jest.spyOn(ProductModel, "updateOne")
      .mockResolvedValue({ modifiedCount: 1 });
  const token = await createAdminAndLogin();
  const res = await request(app)
    .put("/api/product/update-product-details")
    .set("Authorization", `Bearer ${token}`)
    .send({
      _id: "abc123",
      name: "Nuevo nombre"
    });

  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  expect(res.body.error).toBe(false);
  expect(res.body.message).toBe("Producto actualizado exitosamente");
  expect(res.body.data.modifiedCount).toBe(1);
});

test("Debe retornar 400 si no se envía _id", async () => {
  const token = await createAdminAndLogin();
  const res = await request(app)
    .put("/api/product/update-product-details")
    .set("Authorization", `Bearer ${token}`)
    .send({});

  expect(res.status).toBe(400);
  expect(res.body.success).toBe(false);
  expect(res.body.error).toBe(true);
  expect(res.body.message).toBe("Provea el _id del producto");
});

test("Debe retornar 500 si ocurre un error en la BD", async () => {

  jest.spyOn(ProductModel, "updateOne")
      .mockRejectedValue(new Error("Fallo DB"));
  const token = await createAdminAndLogin();
  const res = await request(app)
    .put("/api/product/update-product-details")
    .set("Authorization", `Bearer ${token}`)
    .send({
      _id: "abc123",
      name: "algo"
    });

  expect(res.status).toBe(500);
  expect(res.body.success).toBe(false);
  expect(res.body.error).toBe(true);
  expect(res.body.message).toContain("Fallo DB");
});

//delete-product
test("Debe eliminar el producto exitosamente", async () => {

    ProductModel.deleteOne = jest.fn().mockResolvedValue({
        acknowledged: true,
        deletedCount: 1
    });
    const token = await createAdminAndLogin();
    const res = await request(app)
        .delete("/api/product/delete-product")
        .set("Authorization", `Bearer ${token}`)
        .send({ _id: "product123" });

    expect(ProductModel.deleteOne).toHaveBeenCalledWith({ _id: "product123" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.error).toBe(false);
    expect(res.body.message).toBe("Producto eliminado exitosamente");
    expect(res.body.data.deletedCount).toBe(1);
});

test("Debe retornar 400 si no se envía el _id", async () => {
    const token = await createAdminAndLogin();
    const res = await request(app)
        .delete("/api/product/delete-product")
        .set("Authorization", `Bearer ${token}`)
        .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(true);
    expect(res.body.message).toBe("Provea un _id ");
});

test("Debe retornar 500 si ocurre un error en la BD", async () => {

    ProductModel.deleteOne = jest.fn().mockRejectedValue(new Error("Fallo DB"));
    const token = await createAdminAndLogin();
    const res = await request(app)
        .delete("/api/product/delete-product")
        .set("Authorization", `Bearer ${token}`)
        .send({ _id: "product123" });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(true);
    expect(res.body.message).toContain("Fallo DB");
});

//search-product

test("Debe listar productos con éxito", async () => {

    const mockProducts = [{ name: "Producto 1" }];

    ProductModel.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockProducts)
          })
        })
      })
    });

    ProductModel.countDocuments = jest
      .fn()
      .mockResolvedValue(1);

    const res = await request(app)
      .post("/api/product/search-product")
      .send({
        search: "prod",
        page: 1,
        limit: 10,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.message).toBe("Información de productos");
  });

  test("Debe retornar 500 si ocurre un error en la BD", async () => {

  ProductModel.find = jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          populate: jest.fn().mockRejectedValue(new Error("Fallo DB"))
        })
      })
    })
  });

  const res = await request(app)
    .post("/api/product/search-product")
    .send({ search: "test" });

  expect(res.status).toBe(500);
  expect(res.body.error).toBe(true);
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