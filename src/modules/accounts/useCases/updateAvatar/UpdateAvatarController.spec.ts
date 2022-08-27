import "reflect-metadata";
import request from "supertest";
import fs from "fs";
import path from "path";

import connectionTypeORM from "@shared/infra/typeorm";
import { app } from "@shared/infra/http/app";
import uploadConfig from "@config/upload";
import { UserToken } from "@modules/accounts/infra/typeorm/entities/UserToken";

describe("UpdateAvatarController", () => {
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

  it("should be able to update avatar from logged user", async () => {
    const sessionResponse = await request(app).post("/sessions").send({
      email: "john@example.com",
      password: "password",
    });

    const token = sessionResponse.body.token;

    const fileName = "don.jpg";

    const directory = path.join(__dirname, "testFiles");

    const filePath = path.join(directory, fileName);

    const fileExists = fs.existsSync(filePath);

    if (!fileExists)
      throw new Error(
        `Test failed because the file ${fileName} not found in ${directory}`
      );

    const response = await request(app)
      .patch(`/users/avatar`)
      .set("Connection", "keep-alive")
      .set("Authorization", `Bearer ${token}`)
      .attach("avatar", filePath);

    const avatarUrl = response.body.avatarUrl as string;

    const index = avatarUrl.split("/").length - 1;

    const fileNameInDisk = avatarUrl.split("/")[index];

    fs.unlinkSync(path.resolve(uploadConfig.uploadFolder, fileNameInDisk));

    expect(response.body).toHaveProperty("avatarUrl");
    expect(response.status).toBe(200);
  });

  it("should not be able to update avatar from user if user is not logged in", async () => {
    const token = "non-existing-token";

    const fileName = "don.jpg";

    const directory = path.join(__dirname, "testFiles");

    const filePath = path.join(directory, fileName);

    const fileExists = fs.existsSync(filePath);

    if (!fileExists)
      throw new Error(
        `Test failed because the file ${fileName} not found in ${directory}`
      );

    const response = await request(app)
      .patch(`/users/avatar`)
      .set("Connection", "keep-alive")
      .set("Authorization", `Bearer ${token}`)
      .attach("avatar", filePath);

    expect(response.status).toBe(401);
  });
});
