import "reflect-metadata";
import request from "supertest";

import connectionTypeORM from "@shared/infra/typeorm";
import { app } from "@shared/infra/http/app";
import { UserToken } from "@modules/accounts/infra/typeorm/entities/UserToken";

describe("ListAllBirthdayPersonsController", () => {
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

  it("should be able to list all birthdays persons from user logged in", async () => {
    const sessionResponse = await request(app)
      .post("/sessions")
      .send({ email: "john@example.com", password: "password" });

    const { token } = sessionResponse.body;

    await request(app)
      .post("/birthday-persons")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Birthday Guy",
        birthDate: new Date(1961, 4, 30),
        alarmTime: "08:00",
      });

    await request(app)
      .post("/birthday-persons")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Birthday Guy2",
        birthDate: new Date(1961, 4, 30),
        alarmTime: "08:00",
      });

    await request(app)
      .post("/birthday-persons")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Birthday Guy3",
        birthDate: new Date(1961, 4, 30),
        alarmTime: "08:00",
      });

    const response = await request(app)
      .get("/birthday-persons")
      .set("Authorization", `Bearer ${token}`)
      .query({
        page: 1,
        perPage: 3,
      })
      .send();

    expect(response.body).toHaveLength(3);
  });

  it("should not be able to list all birthdays persons if user is not logged in", async () => {
    const token = "non-existing-token";

    const response = await request(app)
      .get("/birthday-persons")
      .set("Authorization", `Bearer ${token}`)
      .query({
        page: 1,
        perPage: 3,
      })
      .send();

    expect(response.status).toBe(401);
  });
});
