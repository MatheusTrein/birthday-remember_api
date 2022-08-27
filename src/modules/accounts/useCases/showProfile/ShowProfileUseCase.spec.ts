import "reflect-metadata";

import { FakeUsersRepository } from "@modules/accounts/repositories/fakes/FakeUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { FakeHashProvider } from "@shared/container/Providers/HashProvider/fakes/FakeHashProvider";
import { ShowProfileUseCase } from "./ShowProfileUseCase";
import { IUserResponse } from "@modules/accounts/dtos/IUserResponse";
import { AppError } from "@shared/errors/AppError";
import { FakeUserTokensRepository } from "@modules/accounts/repositories/fakes/FakeUserTokensRepository";
import { FakeQueueProvider } from "@shared/container/Providers/QueueProvider/fakes/FakeQueueProvider";

let fakeUsersRepository: FakeUsersRepository;
let fakeUserTokensRepository: FakeUserTokensRepository;
let fakeQueueProvider: FakeQueueProvider;
let fakeHashProvider: FakeHashProvider;
let createUserUseCase: CreateUserUseCase;
let showProfileUseCase: ShowProfileUseCase;

let user: IUserResponse;

describe("ShowProfileUseCase", () => {
  beforeEach(async () => {
    fakeUsersRepository = new FakeUsersRepository();
    fakeUserTokensRepository = new FakeUserTokensRepository();
    fakeQueueProvider = new FakeQueueProvider();
    fakeHashProvider = new FakeHashProvider();
    createUserUseCase = new CreateUserUseCase(
      fakeUsersRepository,
      fakeHashProvider,
      fakeUserTokensRepository,
      fakeQueueProvider
    );
    showProfileUseCase = new ShowProfileUseCase(fakeUsersRepository);

    user = await createUserUseCase.execute({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password",
      timezoneOffSet: 180,
    });
  });

  it("should be able to show user profile", async () => {
    const profile = await showProfileUseCase.execute(user.id);

    expect(profile).toHaveProperty("id");
  });

  it("should not be able to show user profile with a non-existing user", async () => {
    await expect(
      showProfileUseCase.execute("non-existing-user-ID")
    ).rejects.toBeInstanceOf(AppError);
  });
});
