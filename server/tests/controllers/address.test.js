import request from "supertest";
import { jest } from "@jest/globals";
import { connectMemoryDB, stopMemoryDB, clearDB } from "../setup-mongo.js";
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import app from "../../index.js";
import AddressModel from "../../models/address.model.js";
import UserModel from "../../models/user.model.js";

jest.mock("../../middleware/auth.js", () => ({
  __esModule: true,
  default: (req, res, next) => {
    req.userId = "mockUserId";
  },
}));

jest.mock("../../middleware/Admin.js", () => (req, res, next) => next());

describe("Address Controller", () => {
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

 test("Debe crear una dirección correctamente (200)", async () => {
    const fakeAddress = {
      _id: "64f1b5e1d2c123456789abcd",
      city: "Bogotá",
      department: "Cundinamarca",
      address_detail: "Cra 10 # 20-30",
      additional_information: "Apto 301",
      neighborhood: "Chapinero",
      mobile: 3001234567,
      userId: "mockUserId"
    };

    jest.spyOn(AddressModel.prototype, "save").mockResolvedValue(fakeAddress);
    jest.spyOn(UserModel, "findByIdAndUpdate").mockResolvedValue({});
    const token = await createAdminAndLogin();
    const res = await request(app)
      .post("/api/address/create")
      .set("Authorization", `Bearer ${token}`)
      .send({
        city: "Bogotá",
        department: "Cundinamarca",
        address_detail: "Cra 10 # 20-30",
        additional_information: "Apto 301",
        neighborhood: "Chapinero",
        mobile: 3001234567
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.error).toBe(false);
    expect(res.body.message).toBe("Dirección creada exitosamente");
    expect(res.body.data).toEqual(fakeAddress);
  });

  test("Debe retornar 500 si ocurre un error en la DB", async () => {
    jest.spyOn(AddressModel.prototype, "save").mockRejectedValue(new Error("Fallo DB"));
    const token = await createAdminAndLogin();
    const res = await request(app)
      .post("/api/address/create")
      .set("Authorization", `Bearer ${token}`)
      .send({
        city: "Bogotá",
        department: "Cundinamarca",
        address_detail: "Cra 10 # 20-30",
        additional_information: "Apto 301",
        neighborhood: "Chapinero",
        mobile: 3001234567
      });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(true);
    expect(res.body.message).toBe("Fallo DB");
  });

//get

 test("Debe retornar la lista de direcciones correctamente", async () => {
    const fakeAddresses = [
      { _id: "1", city: "Bogotá", userId: "mockUserId" },
      { _id: "2", city: "Medellín", userId: "mockUserId" }
    ];

    jest.spyOn(AddressModel, "find").mockReturnValue({
      sort: jest.fn().mockResolvedValue(fakeAddresses)
    });
    const token = await createAdminAndLogin();
    const res = await request(app)
      .get("/api/address/get")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.error).toBe(false);
    expect(res.body.message).toBe("Lista de dorecciones");
    expect(res.body.data).toEqual(fakeAddresses);
  });

  test("Debe retornar 500 si ocurre un error en la DB", async () => {
    jest.spyOn(AddressModel, "find").mockImplementation(() => {
      return { sort: jest.fn().mockRejectedValue(new Error("Fallo DB")) };
    });

    const token = await createAdminAndLogin();
    const res = await request(app)
      .get("/api/address/get")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(true);
    expect(res.body.message).toBe("Fallo DB");
  });

//update

test("Debe actualizar la dirección correctamente", async () => {
    const fakeUpdateResult = { acknowledged: true, modifiedCount: 1 };

    jest.spyOn(AddressModel, "updateOne").mockResolvedValue(fakeUpdateResult);
    const token = await createAdminAndLogin();
    const res = await request(app)
      .put("/api/address/update")
      .set("Authorization", `Bearer ${token}`)
      .send({
        _id: "address123",
        city: "Bogotá",
        department: "Cundinamarca",
        address_detail: "Calle 123",
        additional_information: "Piso 3",
        neighborhood: "Chapinero",
        mobile: 1234567890
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.error).toBe(false);
    expect(res.body.message).toBe("Dirección actualizada exitosamente");
    expect(res.body.data).toEqual(fakeUpdateResult);
  });

  test("Debe retornar 500 si ocurre un error en la DB", async () => {
    jest.spyOn(AddressModel, "updateOne").mockRejectedValue(new Error("Fallo DB"));

    const token = await createAdminAndLogin();
    const res = await request(app)
      .put("/api/address/update")
      .set("Authorization", `Bearer ${token}`)
      .send({
        _id: "address123",
        city: "Bogotá",
        department: "Cundinamarca",
        address_detail: "Calle 123",
        additional_information: "Piso 3",
        neighborhood: "Chapinero",
        mobile: 1234567890
      });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(true);
    expect(res.body.message).toBe("Fallo DB");
  });

//disable

test("Debe deshabilitar la dirección correctamente", async () => {
    const fakeUpdateResult = { acknowledged: true, modifiedCount: 1 };

    jest.spyOn(AddressModel, "updateOne").mockResolvedValue(fakeUpdateResult);
    const token = await createAdminAndLogin();
    const res = await request(app)
      .delete("/api/address/disable")
      .set("Authorization", `Bearer ${token}`)
      .send({ _id: "address123" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.error).toBe(false);
    expect(res.body.message).toBe("Dirección eliminada exitosamente");
    expect(res.body.data).toEqual(fakeUpdateResult);
  });

  test("Debe retornar 500 si ocurre un error en la DB", async () => {
    jest.spyOn(AddressModel, "updateOne").mockRejectedValue(new Error("Fallo DB"));
    const token = await createAdminAndLogin();
    const res = await request(app)
      .delete("/api/address/disable")
      .set("Authorization", `Bearer ${token}`)
      .send({ _id: "address123" });

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
  
