import { jest } from "@jest/globals";
import { admin } from "../../middleware/Admin.js";
import UserModel from "../../models/user.model.js";

describe("Middleware admin", () => {
  let req, res, next;

  beforeEach(() => {
    req = { userId: "user123" };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("Debe llamar a next() si el usuario es ADMIN", async () => {
    jest.spyOn(UserModel, "findById").mockResolvedValue({ role: "ADMIN" });

    await admin(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test("Debe retornar 400 si el usuario no es ADMIN", async () => {
    jest.spyOn(UserModel, "findById").mockResolvedValue({ role: "USER" });

    await admin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Permisos denegados",
      error: true,
      success: false
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("Debe retornar 500 si ocurre un error", async () => {
    jest.spyOn(UserModel, "findById").mockRejectedValue(new Error("Fallo DB"));

    await admin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Permisos denegados",
      error: true,
      success: false
    });
    expect(next).not.toHaveBeenCalled();
  });
});
