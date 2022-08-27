import "reflect-metadata";
import request from "supertest";

import connectionTypeORM from "@shared/infra/typeorm";
import { app } from "@shared/infra/http/app";
import { UserToken } from "@modules/accounts/infra/typeorm/entities/UserToken";

describe("DisableReminderBirthdayController", () => {
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

  it("should be able to disable the birthday reminder", async () => {
    const sessionResponse = await request(app).post("/sessions").send({
      email: "john@example.com",
      password: "password",
    });

    const { token } = sessionResponse.body;

    const birthdayPersonResponse = await request(app)
      .post("/birthday-persons")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Birthday Guy",
        birthDate: new Date(1961, 4, 30),
        alarmTime: "08:00",
      });

    const { id: birthdayPersonId } = birthdayPersonResponse.body;

    const { body: birthdayPerson } = await request(app)
      .patch(`/birthday-persons/${birthdayPersonId}/disable`)
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(birthdayPerson).toHaveProperty("reminderIsActive", false);
  });

  it("should not be able to disable the birthday reminder if user is not logged in", async () => {
    const sessionResponse = await request(app).post("/sessions").send({
      email: "john@example.com",
      password: "password",
    });

    const { token } = sessionResponse.body;

    const birthdayPersonResponse = await request(app)
      .post("/birthday-persons")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Birthday Guy2",
        birthDate: new Date(1961, 4, 30),
        alarmTime: "08:00",
      });

    const { id: birthdayPersonId } = birthdayPersonResponse.body;

    const invalidToken = "non-existing-token";

    const response = await request(app)
      .patch(`/birthday-persons/${birthdayPersonId}/disable`)
      .set("Authorization", `Bearer ${invalidToken}`)
      .send();

    expect(response.status).toBe(401);
  });
});
