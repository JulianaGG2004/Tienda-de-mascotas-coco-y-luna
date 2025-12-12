import { jest } from "@jest/globals";
import auth from "../../middleware/auth.js";
import jwt from "jsonwebtoken";

describe("Middleware auth", () => {
  let req, res, next;

  beforeEach(() => {
    req = { cookies: {}, headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("Debe llamar a next() si el token es válido", async () => {
    const fakeToken = "token123";
    const decoded = { id: "user123" };

    req.cookies.accessToken = fakeToken;
    jest.spyOn(jwt, "verify").mockReturnValue(decoded);

    await auth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.userId).toBe("user123");
  });

  test("Debe retornar 401 si no se proporciona token", async () => {
    await auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Proporcione un token"
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("Debe retornar 401 si el token es inválido", async () => {
    const fakeToken = "token123";
    req.cookies.accessToken = fakeToken;

    jest.spyOn(jwt, "verify").mockReturnValue(null);

    await auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Acceso no autorizado",
      error: true,
      success: false
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("Debe retornar 500 si ocurre un error en jwt.verify", async () => {
    const fakeToken = "token123";
    req.cookies.accessToken = fakeToken;

    jest.spyOn(jwt, "verify").mockImplementation(() => {
      throw new Error("Fallo JWT");
    });

    await auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "No has iniciado sesión",
      error: true,
      success: false
    });
    expect(next).not.toHaveBeenCalled();
  });
});
