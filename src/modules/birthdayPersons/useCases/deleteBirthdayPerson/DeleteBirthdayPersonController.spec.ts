import "reflect-metadata";
import request from "supertest";

import connectionTypeORM from "@shared/infra/typeorm";
import { app } from "@shared/infra/http/app";
import { IUserResponse } from "@modules/accounts/dtos/IUserResponse";
import { BirthdayPerson } from "@modules/birthdayPersons/infra/typeorm/entities/BirthdayPerson";
import { UserToken } from "@modules/accounts/infra/typeorm/entities/UserToken";

let user: IUserResponse;

describe("DeleteBirthdayPersonController", () => {
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

  it("should be able to delete a birthday person from a user if user is authenticated", async () => {
    const sessionResponse = await request(app).post("/sessions").send({
      email: "john@example.com",
      password: "password",
    });

    const { token } = sessionResponse.body;

    const createBirthdayPersonResponse = await request(app)
      .post("/birthday-persons")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Birthday Guy",
        birthDate: new Date(1961, 4, 30).toISOString(),
        alarmTime: "08:00",
      });

    const birthdayPerson: BirthdayPerson = createBirthdayPersonResponse.body;

    const deleteBirthdayPersonResponse = await request(app)
      .del(`/birthday-persons/${birthdayPerson.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(deleteBirthdayPersonResponse.status).toBe(204);
  });

  it("should not be able to delete a birthday person from a user if user is not authenticated", async () => {
    const sessionResponse = await request(app).post("/sessions").send({
      email: "john@example.com",
      password: "password",
    });

    let { token } = sessionResponse.body;

    const createBirthdayPersonResponse = await request(app)
      .post("/birthday-persons")
      .set("Authorizarion", `Bearer ${token}`)
      .send({
        name: "Birthday Guy",
        birthDate: new Date(1961, 4, 30).toISOString(),
        alarmTime: "08:00",
      });

    const birthdayPerson: BirthdayPerson = createBirthdayPersonResponse.body;

    token = "invalid-token";

    const deleteBirthdayPersonResponse = await request(app)
      .del(`/birthday-persons/${birthdayPerson.id}`)
      .set("Authorizarion", `Bearer ${token}`)
      .send();

    expect(deleteBirthdayPersonResponse.status).toBe(401);
  });
});
