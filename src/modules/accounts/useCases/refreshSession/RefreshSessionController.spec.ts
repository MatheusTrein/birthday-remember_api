import "reflect-metadata";
import request from "supertest";

import connectionTypeORM from "@shared/infra/typeorm";
import { app } from "@shared/infra/http/app";
import { UserToken } from "@modules/accounts/infra/typeorm/entities/UserToken";

describe("RefreshSessionController", () => {
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

  it("should be able to refresh session", async () => {
    const authResponse = await request(app).post("/sessions").send({
      email: "john@example.com",
      password: "password",
    });

    const { refreshToken } = authResponse.body;

    const response = await request(app).post("/sessions/refresh").send({
      refreshToken,
    });

    expect(response.body).toHaveProperty("refreshToken");
    expect(response.status).toBe(200);
  });
});
