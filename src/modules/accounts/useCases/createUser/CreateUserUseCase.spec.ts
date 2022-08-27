import "reflect-metadata";

import { FakeUsersRepository } from "@modules/accounts/repositories/fakes/FakeUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { AppError } from "@shared/errors/AppError";
import { FakeHashProvider } from "@shared/container/Providers/HashProvider/fakes/FakeHashProvider";
import { FakeQueueProvider } from "@shared/container/Providers/QueueProvider/fakes/FakeQueueProvider";
import { FakeUserTokensRepository } from "@modules/accounts/repositories/fakes/FakeUserTokensRepository";
import { VerifyUserUseCase } from "../verifyUser/VerifyUserUseCase";
import { UserToken } from "@modules/accounts/infra/typeorm/entities/UserToken";

let fakeUsersRepository: FakeUsersRepository;
let fakeUserTokensRepository: FakeUserTokensRepository;
let fakeHashProvider: FakeHashProvider;
let fakeQueueProvider: FakeQueueProvider;
let createUserUseCase: CreateUserUseCase;
let verifyUserUseCase: VerifyUserUseCase;

describe("CreateUserUseCase", () => {
  beforeEach(async () => {
    fakeUsersRepository = new FakeUsersRepository();
    fakeUserTokensRepository = new FakeUserTokensRepository();
    fakeHashProvider = new FakeHashProvider();
    fakeQueueProvider = new FakeQueueProvider();
    createUserUseCase = new CreateUserUseCase(
      fakeUsersRepository,
      fakeHashProvider,
      fakeUserTokensRepository,
      fakeQueueProvider
    );
  });

  it("should be able to create a user", async () => {
    const user = await createUserUseCase.execute({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password",
      timezoneOffSet: 180,
    });

    expect(user).toHaveProperty("id");
    expect(user).not.toHaveProperty("password");
  });

  it("should not be albe to create a user if email already registered", async () => {
    await createUserUseCase.execute({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password",
      timezoneOffSet: 180,
    });

    await expect(
      createUserUseCase.execute({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password",
        timezoneOffSet: 180,
      })
    ).rejects.toBeInstanceOf(AppError);
  });
});
