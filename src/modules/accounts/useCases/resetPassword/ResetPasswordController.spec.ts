import "reflect-metadata";
import request from "supertest";

import connectionTypeORM from "@shared/infra/typeorm";
import { app } from "@shared/infra/http/app";
import { UserToken } from "@modules/accounts/infra/typeorm/entities/UserToken";
import { IUserResponse } from "@modules/accounts/dtos/IUserResponse";

let user: IUserResponse;

describe("ResetPasswordController", () => {
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

    user = createUserResponse.body;
  });
  afterAll(async () => {
    await connectionTypeORM.dropDatabase();
    await connectionTypeORM.destroy();
  });

  it("should be able to reset a password with a valid token", async () => {
    await request(app)
      .post("/password/forgot")
      .send({ email: "john@example.com" });

    const userTokensRepository = connectionTypeORM.getRepository(UserToken);

    const userToken = (await userTokensRepository.findOne({
      where: { userId: user.id, type: "forgotPasswordUserToken" },
    })) as UserToken;

    const response = await request(app)
      .post(`/password/reset?token=${userToken.token}`)
      .send({ password: "newPassword" });

    expect(response.status).toBe(204);
  });
});
