import "reflect-metadata";
import request from "supertest";
import path from "path";
import fs from "fs";

import connectionTypeORM from "@shared/infra/typeorm";
import { app } from "@shared/infra/http/app";
import { IUserResponse } from "@modules/accounts/dtos/IUserResponse";
import uploadConfig from "@config/upload";
import { UserToken } from "@modules/accounts/infra/typeorm/entities/UserToken";

let user: IUserResponse;

describe("UpdateUserController", () => {
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

  it("should be able to update a user if user is logged in", async () => {
    const sessionResponse = await request(app)
      .post("/sessions")
      .send({ email: "john@example.com", password: "password" });

    const { token } = sessionResponse.body;

    const fileName = "don.jpg";

    const directory = path.join(__dirname, "testFiles");
    const pathFile = path.join(directory, fileName);

    const fileExist = fs.existsSync(pathFile);

    if (!fileExist) {
      throw new Error(
        `Test failed because the file ${fileName} is not in the directory ${directory}`
      );
    }

    const response = await request(app)
      .put("/users")
      .set("Authorization", `Bearer ${token}`)
      .field("firstName", "Updated")
      .field("lastName", "John")
      .field("oldPassword", "password")
      .field("newPassword", "passwordUpdated")
      .field("timezoneOffSet", "240")
      .attach("avatar", pathFile);

    const avatarUrl = response.body.avatarUrl as string;

    const index = avatarUrl.split("/").length - 1;

    const fileNameInDisk = avatarUrl.split("/")[index];

    fs.unlinkSync(path.resolve(uploadConfig.uploadFolder, fileNameInDisk));

    expect(response.status).toBe(200);
  });

  it("should not be able to update a user if user is not logged in", async () => {
    const token = "wonrg-token";

    const fileName = "don.jpg";

    const directory = path.join(__dirname, "testFiles");
    const pathFile = path.join(directory, fileName);

    const fileExist = fs.existsSync(pathFile);

    if (!fileExist) {
      throw new Error(
        `Test failed because the file ${fileName} is not in the directory ${directory}`
      );
    }

    const response = await request(app)
      .put("/users")
      .set("Authorization", `Bearer ${token}`)
      .field("firstName", "Updated")
      .field("lastName", "John")
      .field("oldPassword", "password")
      .field("newPassword", "passwordUpdated")
      .field("timezoneOffSet", "240")
      .attach("avatar", pathFile);

    expect(response.status).toBe(401);
  });
});
