import "reflect-metadata";
import request from "supertest";

import connectionTypeORM from "@shared/infra/typeorm";
import { app } from "@shared/infra/http/app";
import { BirthdayPerson } from "@modules/birthdayPersons/infra/typeorm/entities/BirthdayPerson";
import { UserToken } from "@modules/accounts/infra/typeorm/entities/UserToken";

describe("UpdateBirthdayPersonController", () => {
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

  it("should be able to update a birthday person from user", async () => {
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

    const birthdayPerson: BirthdayPerson = birthdayPersonResponse.body;

    const updateBirthdayPersonResponse = await request(app)
      .put(`/birthday-persons/${birthdayPerson.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Birthday Guy Updated",
        birthDate: new Date(1962, 1, 25),
        alarmTime: "08:00",
      });

    const updatedBirthdayPerson = updateBirthdayPersonResponse.body;

    expect(updateBirthdayPersonResponse.status).toBe(200);
    expect(updatedBirthdayPerson).toEqual(
      expect.objectContaining({
        name: "Birthday Guy Updated",
        birthDate: new Date(1962, 1, 25).toISOString(),
        alarmTime: "08:00",
      })
    );
  });

  it("should not be able to update a birthday person if user is not logged in", async () => {
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
        birthDate: new Date(1961, 4, 30),
        alarmTime: "08:00",
      });

    const birthdayPerson = birthdayPersonResponse.body;

    token = "non-existing-token";

    const response = await request(app)
      .put(`/birthday-persons/${birthdayPerson}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Birthday Guy2",
        birthDate: new Date(1961, 4, 30),
        alarmTime: "08:00",
      });

    expect(response.status).toBe(401);
  });
});
