import "reflect-metadata";
import request from "supertest";

import { app } from "@shared/infra/http/app";
import connectionTypeORM from "@shared/infra/typeorm";

describe("CreateUserController", () => {
  beforeAll(async () => {
    await connectionTypeORM.initialize();
    await connectionTypeORM.runMigrations();
  });
  afterAll(async () => {
    await connectionTypeORM.dropDatabase();
    await connectionTypeORM.destroy();
  });

  it("should be able to create a user", async () => {
    const response = await request(app).post("/users").send({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password",
      timezoneOffSet: 180,
    });

    expect(response.body).toHaveProperty("id");
    expect(response.status).toBe(201);
  });
});
