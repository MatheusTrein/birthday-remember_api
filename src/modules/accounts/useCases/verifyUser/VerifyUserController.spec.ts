import "reflect-metadata";
import request from "supertest";

import connectionTypeORM from "@shared/infra/typeorm";
import { app } from "@shared/infra/http/app";
import { IUserResponse } from "@modules/accounts/dtos/IUserResponse";
import { UserToken } from "@modules/accounts/infra/typeorm/entities/UserToken";

describe("VerifyUserController", () => {
  beforeAll(async () => {
    await connectionTypeORM.initialize();
    await connectionTypeORM.runMigrations();
  });
  afterAll(async () => {
    await connectionTypeORM.dropDatabase();
    await connectionTypeORM.destroy();
  });

  it("should be able to verify user", async () => {
    const createUserResponse = await request(app).post("/users").send({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password",
      timezoneOffSet: 180,
    });

    const user: IUserResponse = createUserResponse.body;

    const userTokensRepository = connectionTypeORM.getRepository(UserToken);

    const verifyUserToken = (await userTokensRepository.findOne({
      where: {
        type: "verifyUserToken",
        userId: user.id,
      },
    })) as UserToken;

    const verifyUserResponse = await request(app)
      .patch(`/users/verify/?token=${verifyUserToken.token}`)
      .send();

    expect(verifyUserResponse.status).toBe(200);
  });
});
