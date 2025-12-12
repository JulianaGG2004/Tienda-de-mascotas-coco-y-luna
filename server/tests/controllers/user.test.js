// tests/user/user.test.js
import request from "supertest";
import { jest } from "@jest/globals";
import mongoose from "mongoose";
jest.mock("../../middleware/auth.js", () => ({
  __esModule: true,
  default: (req, res, next) => {
    req.userId = "mockUserId"; // simula usuario autenticado
    next();
  },
}));



import app from "../../index.js";
import { connectMemoryDB, stopMemoryDB, clearDB } from "../setup-mongo.js";
import UserModel from "../../models/user.model.js";
import bcryptjs from "bcryptjs";

jest.mock("jsonwebtoken");
  jest.mock("../../utils/generatedAccessToken.js");

jest.mock("../../config/sendEmail.js", () =>
  jest.fn(() => Promise.resolve(true))
);
jest.mock("../../utils/uploadImageCloudinary.js", () =>
  jest.fn(() => Promise.resolve({ url: "http://fakeurl.com/avatar.png" }))
);
jest.mock("../../utils/generatedAccessToken.js", () =>
  jest.fn((id) => `access-token-${id}`)
);
jest.mock("../../utils/generatedRefreshToken.js", () =>
  jest.fn((id) => `refresh-token-${id}`)
);
jest.mock("../../utils/generatedOtp.js", () => jest.fn(() => "123456"));
jest.mock("jsonwebtoken", () => ({
  verify: jest.fn((token) => ({ _id: "mockUserId" })),
}));

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
  sign: jest.fn()
}));

describe("User Controller - register & login", () => {
  beforeAll(async () => {
    await connectMemoryDB();
  });

  afterEach(async () => {
    await clearDB();
  });

  afterAll(async () => {
    await stopMemoryDB();
  });
///register
  test("Debe registrar un usuario correctamente", async () => {
    const res = await request(app).post("/api/user/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "123456",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty("message");
    expect(res.body.data.email).toBe("test@example.com");
    expect(res.body.message).toBe("Usuario registrado con exito")
  });

  test("Debe evitar registrarse con un correo ya existente", async () => {
    await request(app).post("/api/user/register").send({
      name: "User1",
      email: "login@test.com",
      password: "123456",
    });
    const res = await request(app).post("/api/user/register").send({
      name: "User2",
      email: "login@test.com",
      password: "abcdef",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Error, el correo ya existe")
  });

  test("Debe fallar si faltan campos requeridos", async () => {
    const res = await request(app).post("/api/user/register").send({
      email: "test@test.com",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe(true);
    expect(res.body.message).toBe("Ingrese el correo, nombre de usuario y contraseña")
  });

  test("Debe fallar si el usuario no existe", async () => {
    const res = await request(app).post("/api/user/login").send({
      email: "noexiste@test.com",
      password: "123456",
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Usuario no esta registrado");
  });
  

//verify-email

  test("Debe verificar correo correctamente con código válido", async () => {
    // Creamos un usuario en la DB en memoria
    const password = await bcryptjs.hash("123456", 10);
    const user = await UserModel.create({
      name: "Test User",
      password,
      email: "test@example.com",
      verify_email: false
    });

    const res = await request(app)
      .post("/api/user/verify-email")
      .send({ code: user._id.toString() }); //ObjectId válido

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Se ha verificado el correo");

    const updatedUser = await UserModel.findById(user._id);
    expect(updatedUser.verify_email).toBe(true);
  });

  test("Devuelve error si código inválido", async () => {
    const fakeId = new mongoose.Types.ObjectId(); // genera ObjectId válido pero que no existe
    const res = await request(app)
      .post("/api/user/verify-email")
      .send({ code: fakeId.toString() });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Codigo invalido");
  });

///login
  test("Debe iniciar sesión correctamente", async () => {
    const password = await bcryptjs.hash("123456", 10);
    await UserModel.create({
      name: "Test",
      email: "test@test.com",
      password,
      status: "Active",
    });

    const res = await request(app)
      .post("/api/user/login")
      .send({ email: "test@test.com", password: "123456" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Inicio de sesión Exitoso");
    expect(res.body.data).toHaveProperty("accesstoken");
    expect(res.body.data).toHaveProperty("refreshToken");
  });

  test("Debe iniciar sesión con una contraseña valida", async () => {
    const password = await bcryptjs.hash("123456", 10);
    await UserModel.create({
      name: "Test",
      email: "test@test.com",
      password,
      status: "Active",
    });

    const res = await request(app)
      .post("/api/user/login")
      .send({ email: "test@test.com", password: "09876" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Verifica tu contraseña");
  });

  test("Debe iniciar sesión con una cuenta activa", async () => {
    const password = await bcryptjs.hash("123456", 10);
    await UserModel.create({
      name: "Test",
      email: "test@test.com",
      password,
      status: "Inactive",
    });

    const res = await request(app)
      .post("/api/user/login")
      .send({ email: "test@test.com", password: "123456" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Contacte al administrador");
  });

  test("Debe iniciar sesión ingresando el email o contraseña", async () => {
    const password = await bcryptjs.hash("123456", 10);
    await UserModel.create({
      name: "Test",
      email: "test@test.com",
      password,
      status: "Active",
    });

    const res = await request(app)
      .post("/api/user/login")
      .send({ password: "123456" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Ingrese el email o contraseña");
  });


  test("Debe devolver error 500 si ocurre un error interno al iniciar sesión", async () => {
      
      const password = await bcryptjs.hash("123456", 10);
      await UserModel.create({
        name: "Test",
        email: "test@test.com",
        password,
        status: "Active",
      });
      const originalFindOne = UserModel.findOne;

      UserModel.findOne = jest.fn().mockRejectedValue(new Error("Fallo interno DB"));

      const res = await request(app)
        .post("/api/user/login")
        .send({ email: "test@test.com", password: "123456" });

      expect(res.status).toBe(500);
      expect(res.body.error).toBe(true);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Fallo interno DB");

      UserModel.findOne = originalFindOne;
  });

///logout
  test("Debe cerrar sesión correctamente", async () => {
    const password = await bcryptjs.hash("123456", 10);
    const user = await UserModel.create({
      name: "Test",
      email: "test@test.com",
      password,
      status: "Active",
    });

    const loginRes = await request(app)
      .post("/api/user/login")
      .send({ email: "test@test.com", password: "123456" });

    const token = loginRes.body.data.accesstoken;
      const res = await request(app).get("/api/user/logout")
      .set("Authorization", `Bearer ${token}`)
      .set("userId", user._id);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Cierre de sesión exitoso")
    });

  test("Debe retornar error 500 si ocurre un fallo interno al cerrar sesión", async () => {
    const password = await bcryptjs.hash("123456", 10);

    const user = await UserModel.create({
      name: "Test",
      email: "test@test.com",
      password,
      status: "Active",
    });

    // 1️⃣ Login normal para obtener token real
    const loginRes = await request(app)
      .post("/api/user/login")
      .send({ email: "test@test.com", password: "123456" })
      .expect(200);

    const token = loginRes.body.data.accesstoken;

    // 2️⃣ Forzar que findByIdAndUpdate falle
    jest
      .spyOn(UserModel, "findByIdAndUpdate")
      .mockImplementationOnce(() => {
        throw new Error("Error interno de prueba");
      });

    // 3️⃣ Intentar cerrar sesión → debe dar 500
    const res = await request(app)
      .get("/api/user/logout")
      .set("Authorization", `Bearer ${token}`)
      .set("userId", user._id);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Error interno de prueba");
  });

///forgot-password
  test("Debe enviar OTP de recuperación de contraseña", async () => {
    const user = await UserModel.create({
      name: "Test",
      email: "test@test.com",
      password: "123456",
    });
    const res = await request(app)
      .put("/api/user/forgot-password")
      .send({ email: "test@test.com" });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Verifica tu email")
  });

  test("Debe enviar OTP de un correo valido", async () => {
    const user = await UserModel.create({
      name: "Test",
      email: "test@test.com",
      password: "123456",
    });
    const res = await request(app)
      .put("/api/user/forgot-password")
      .send({ email: "test@testt.com" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Correo electronico no esta disponible")
  });

  test("Debe devolver 500 si ocurre un error interno al enviar OTP de recuperación", async () => {
    const user = await UserModel.create({
      name: "Test",
      email: "test@test.com",
      password: "123456",
    });

    const spy = jest
      .spyOn(UserModel, "findOne")
      .mockRejectedValue(new Error("Error interno DB"));

    const res = await request(app)
      .put("/api/user/forgot-password")
      .send({ email: "test@test.com" });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe(true);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Error interno DB");
    spy.mockRestore();
  });
///verify-forgot-password-otp
  test("Debe verificar OTP correctamente", async () => {
    const user = await UserModel.create({
      name: "Test",
      email: "test@test.com",
      password: "123456",
      forgot_password_otp: "123456",
      forgot_password_expiry: new Date(Date.now() + 3600 * 1000),
    });
    const res = await request(app)
      .put("/api/user/verify-forgot-password-otp")
      .send({ email: "test@test.com", otp: "123456" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true)
    expect(res.body.message).toBe("Verificacion de OTP Exitosa");
  });

  test("Debe OTP sin correo electronico", async () => {
    const user = await UserModel.create({
      name: "Test",
      email: "test@test.com",
      password: "123456",
      forgot_password_otp: "123456",
      forgot_password_expiry: new Date(Date.now() + 3600 * 1000),
    });
    const res = await request(app)
      .put("/api/user/verify-forgot-password-otp")
      .send({ otp: "123456" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false)
    expect(res.body.message).toBe("Proporcione el correo electrónico en el campo obligatorio.");
  });

  test("Debe OTP correo no disponible", async () => {
    const user = await UserModel.create({
      name: "Test",
      email: "test@test.com",
      password: "123456",
      forgot_password_otp: "123456",
      forgot_password_expiry: new Date(Date.now() + 3600 * 1000),
    });
    const res = await request(app)
      .put("/api/user/verify-forgot-password-otp")
      .send({ email: "test@test.comm",otp: "123456" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false)
    expect(res.body.message).toBe("Correo electronico no esta disponible");
  });

  test("Debe OTP esta expirado", async () => {
    const user = await UserModel.create({
      name: "Test",
      email: "test@test.com",
      password: "123456",
      forgot_password_otp: "585858",
      forgot_password_expiry: "2025-12-05T10:00:00.000Z",
    });
    const res = await request(app)
      .put("/api/user/verify-forgot-password-otp")
      .send({ email: "test@test.com",otp: "123456" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false)
    expect(res.body.message).toBe("OTP Invalido");
  });

  test("Debe OTP error de sistema 500", async () => {
    jest.spyOn(UserModel, "findOne").mockImplementationOnce(() => {
      throw new Error("Error de prueba");
    });
    const res = await request(app)
      .put("/api/user/verify-forgot-password-otp")
      .send({ email: "test@test.com",otp: "123456", campo: "falso" });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
///update-user
  test("Debe actualizar detalles del usuario", async () => {
    const password = await bcryptjs.hash("123456", 10);
    const user = await UserModel.create({
      name: "Test",
      email: "test@test.com",
      password,
      status: "Active",
    });

    const loginRes = await request(app)
      .post("/api/user/login")
      .send({ email: "test@test.com", password: "123456" });

    const token = loginRes.body.data.accesstoken;

    const res = await request(app)
      .put("/api/user/update-user")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Nombre Actualizado" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
///user-details
  test("Debe obtener detalles del usuario", async () => {
    const password = await bcryptjs.hash("123456", 10);
    const user = await UserModel.create({
      name: "Test",
      email: "test@test.com",
      password,
      status: "Active",
    });

    const loginRes = await request(app)
      .post("/api/user/login")
      .send({ email: "test@test.com", password: "123456" });

    const token = loginRes.body.data.accesstoken;

    const res = await request(app)
      .get("/api/user/user-details")
      .set("Authorization", `Bearer ${token}`)
      .set("userId", user._id);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe("test@test.com");
  });

///reset-password

test("Debe actualizar la contraseña exitosamente", async () => {
    const user = await UserModel.create({
      name: "Test",
      email: "test@test.com",
      password: "123456",
      forgot_password_otp: "123456",
      forgot_password_expiry: new Date(Date.now() + 3600 * 1000),
    });
    const res = await request(app)
      .put("/api/user/reset-password")
      .send({ email: "test@test.com", newPassword : "1234566" , confirmPassword : "1234566" });
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.message).toBe("Contraseña actualizada exitosamente");
  });

test("Debe ingresar los campos requeridos correo, contraseña y confiracion de contraseña", async () => {
    const user = await UserModel.create({
      name: "Test",
      email: "test@test.com",
      password: "123456",
      forgot_password_otp: "123456",
      forgot_password_expiry: new Date(Date.now() + 3600 * 1000),
    });
    const res = await request(app)
      .put("/api/user/reset-password")
      .send({ email: "test@test.com", newPassword : "1234566" });
    expect(res.status).toBe(400)
    expect(res.body.message).toBe("Ingrese los campos requeridos correo, contraseña y confiracion de contraseña");
  });

test("Debe ingresar un correo disponible", async () => {
    const user = await UserModel.create({
      name: "Test",
      email: "test@test.com",
      password: "123456",
      forgot_password_otp: "123456",
      forgot_password_expiry: new Date(Date.now() + 3600 * 1000),
    });
    const res = await request(app)
      .put("/api/user/reset-password")
      .send({ email: "test@test.comm", newPassword : "1234566", confirmPassword : "1234566" });
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
    expect(res.body.message).toBe("El correo no esta disponible.");
  });

  test("Debe la nueva contraseña y la confirmacion de contraseña deben coincidir", async () => {
    const user = await UserModel.create({
      name: "Test",
      email: "test@test.com",
      password: "123456",
      forgot_password_otp: "123456",
      forgot_password_expiry: new Date(Date.now() + 3600 * 1000),
    });
    const res = await request(app)
      .put("/api/user/reset-password")
      .send({ email: "test@test.com", newPassword : "1234566", confirmPassword : "12345667" });
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
    expect(res.body.message).toBe("La nueva contraseña y la confirmacion de contraseña deben coincidir.");
  });
});

//refresh-token

test("Debe devolver error 500 si ocurre un fallo interno", async () => {

  const res = await request(app)
    .post("/api/user/refresh-token")
    .set("Cookie", "refreshToken=mockToken");

  expect(res.status).toBe(500);
  expect(res.body.error).toBe(true);
});