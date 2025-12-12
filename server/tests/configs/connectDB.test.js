import request from "supertest";
import { jest } from "@jest/globals";
import mongoose from "mongoose";
import connectDB from "../../config/connectDB.js";

describe("connectDB", () => {

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("Debe conectar correctamente a la DB", async () => {
    const connectSpy = jest.spyOn(mongoose, "connect").mockResolvedValueOnce(true);

    await connectDB();

    expect(connectSpy).toHaveBeenCalledWith(process.env.MONGODB_URI);
  });

  test("Debe manejar error al conectar a la DB", async () => {
    const error = new Error("Fallo DB");
    jest.spyOn(mongoose, "connect").mockRejectedValueOnce(error);
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => { throw new Error("exit"); });

    await expect(connectDB()).rejects.toThrow("exit");

    expect(consoleSpy).toHaveBeenCalledWith("Mongodb error de conexion ", error);
    expect(exitSpy).toHaveBeenCalledWith(1);

    consoleSpy.mockRestore();
    exitSpy.mockRestore();
  });
});