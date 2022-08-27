import "reflect-metadata";
import request from "supertest";

import connectionTypeORM from "@shared/infra/typeorm";
import { app } from "@shared/infra/http/app";
import { UserToken } from "@modules/accounts/infra/typeorm/entities/UserToken";

describe("ShowProfileController", () => {
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

  it("should be able to show profile if user is authenticaded", async () => {
    const sessionResponse = await request(app)
      .post("/sessions")
      .send({ email: "john@example.com", password: "password" });

    const { token } = sessionResponse.body;

    const showProfileResponse = await request(app)
      .get("/users/show")
      .set("Authorization", `Bearer ${token}`)
      .send();

    const user = showProfileResponse.body;

    expect(showProfileResponse.status).toBe(200);
    expect(user).toHaveProperty("id");
  });

  it("should not be able to show profile if user is not authenticaded", async () => {
    const token = "non-existing-token";

    const showProfileResponse = await request(app)
      .get("/users/show")
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(showProfileResponse.status).toBe(401);
  });
});
