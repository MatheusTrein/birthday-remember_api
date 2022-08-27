import request from "supertest";
import requestIp from "request-ip";
import "reflect-metadata";

import { app } from "@shared/infra/http/app";

import connectionTypeORM from "@shared/infra/typeorm";
import { UserToken } from "@modules/accounts/infra/typeorm/entities/UserToken";

describe("CreateSessionController", () => {
  beforeAll(async () => {
    await connectionTypeORM.initialize();
    await connectionTypeORM.runMigrations();

    const createUserResponse = await request(app).post("/users").send({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password",
      timezoneOffSet: 180,
    });

    const user = createUserResponse.body;

    const userTokensRepository = connectionTypeORM.getRepository(UserToken);

    const verifyUserToken = (await userTokensRepository.findOne({
      where: {
        type: "verifyUserToken",
        userId: user.id,
      },
    })) as UserToken;

    await request(app)
      .patch(`/users/verify/?token=${verifyUserToken.token}`)
      .send();
  });

  afterAll(async () => {
    await connectionTypeORM.dropDatabase();
    await connectionTypeORM.destroy();
  });

  it("should be able to create a session with correct credencials", async () => {
    const response = await request(app).post("/sessions").send({
      email: "john@example.com",
      password: "password",
    });

    expect(response.body).toHaveProperty("token");
    expect(response.status).toBe(200);
  });

  it("should not be able to create a session when ip is null", async () => {
    jest.spyOn(requestIp, "getClientIp").mockImplementationOnce(() => {
      return null;
    });

    const response = await request(app).post("/sessions").send({
      email: "john@example.com",
      password: "password",
    });

    expect(response.status).toBe(401);
  });
});
