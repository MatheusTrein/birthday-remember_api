import "reflect-metadata";
import request from "supertest";

import connectionTypeORM from "@shared/infra/typeorm";
import { app } from "@shared/infra/http/app";
import { UserToken } from "@modules/accounts/infra/typeorm/entities/UserToken";

describe("EnableReminderBirthdayController", () => {
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

  it("should be able to enable reminder of birthday person", async () => {
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
        birthDate: new Date(1961, 4, 30).toISOString(),
        alarmTime: "08:00",
      });

    const birthdayPersonId = birthdayPersonResponse.body.id;

    await request(app)
      .patch(`/birthday-persons/${birthdayPersonId}/disable`)
      .set("Authorization", `Bearer ${token}`)
      .send();

    const enableReminderResponse = await request(app)
      .patch(`/birthday-persons/${birthdayPersonId}/enable`)
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(enableReminderResponse.body).toHaveProperty(
      "reminderIsActive",
      true
    );
    expect(enableReminderResponse.status).toBe(200);
  });

  it("should not be able to enable reminder of birthday person if user is not authenticated", async () => {
    const sessionResponse = await request(app).post("/sessions").send({
      email: "john@example.com",
      password: "password",
    });

    let { token } = sessionResponse.body;

    const birthdayPersonResponse = await request(app)
      .post("/birthday-persons")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Birthday Guy",
        birthDate: new Date(1961, 4, 30).toISOString(),
        alarmTime: "08:00",
      });

    const birthdayPersonId = birthdayPersonResponse.body.id;

    await request(app)
      .patch(`/birthday-persons/${birthdayPersonId}/disable`)
      .set("Authorization", `Bearer ${token}`)
      .send();

    token = "non-exinsting-token";

    const enableReminderResponse = await request(app)
      .patch(`/birthday-persons/${birthdayPersonId}/enable`)
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(enableReminderResponse.status).toBe(401);
  });
});
