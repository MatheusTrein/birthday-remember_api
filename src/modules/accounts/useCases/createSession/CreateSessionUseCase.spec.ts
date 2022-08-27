import "reflect-metadata";

import { FakeRefreshTokensRepository } from "@modules/accounts/repositories/fakes/FakeRefreshTokensRepository";
import { FakeUsersRepository } from "@modules/accounts/repositories/fakes/FakeUsersRepository";
import { FakeDateProvider } from "@shared/container/Providers/DateProvider/fakes/FakeDateProvider";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { CreateSessionUseCase } from "./CreateSessionUseCase";
import { AppError } from "@shared/errors/AppError";
import { FakeAuthProvider } from "@shared/container/Providers/AuthProvider/fakes/FakeAuthProvider";
import { FakeHashProvider } from "@shared/container/Providers/HashProvider/fakes/FakeHashProvider";
import { FakeUserTokensRepository } from "@modules/accounts/repositories/fakes/FakeUserTokensRepository";
import { FakeQueueProvider } from "@shared/container/Providers/QueueProvider/fakes/FakeQueueProvider";
import { VerifyUserUseCase } from "../verifyUser/VerifyUserUseCase";
import { UserToken } from "@modules/accounts/infra/typeorm/entities/UserToken";

let fakeUsersRepository: FakeUsersRepository;
let fakeRefreshTokensRepository: FakeRefreshTokensRepository;
let fakeUserTokensRepository: FakeUserTokensRepository;
let fakeQueueProvider: FakeQueueProvider;
let fakeDateProvider: FakeDateProvider;
let fakeAuthProvider: FakeAuthProvider;
let fakeHashProvider: FakeHashProvider;
let createUserUseCase: CreateUserUseCase;
let createSessionUseCase: CreateSessionUseCase;
let verifyUserUseCase: VerifyUserUseCase;

describe("CreateSessionUseCase", () => {
  beforeEach(async () => {
    fakeUsersRepository = new FakeUsersRepository();
    fakeRefreshTokensRepository = new FakeRefreshTokensRepository();
    fakeUserTokensRepository = new FakeUserTokensRepository();
    fakeQueueProvider = new FakeQueueProvider();
    fakeDateProvider = new FakeDateProvider();
    fakeAuthProvider = new FakeAuthProvider();
    fakeHashProvider = new FakeHashProvider();
    createUserUseCase = new CreateUserUseCase(
      fakeUsersRepository,
      fakeHashProvider,
      fakeUserTokensRepository,
      fakeQueueProvider
    );
    createSessionUseCase = new CreateSessionUseCase(
      fakeUsersRepository,
      fakeRefreshTokensRepository,
      fakeDateProvider,
      fakeHashProvider,
      fakeAuthProvider
    );
    verifyUserUseCase = new VerifyUserUseCase(
      fakeUsersRepository,
      fakeUserTokensRepository
    );

    const user = await createUserUseCase.execute({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password",
      timezoneOffSet: 180,
    });

    const verifyUserToken = (await fakeUserTokensRepository.findByUserIdAndType(
      user.id,
      "verifyUserToken"
    )) as UserToken;

    await verifyUserUseCase.execute(verifyUserToken.token);
  });

  it("should be able to create a session with correct credencials", async () => {
    const response = await createSessionUseCase.execute({
      email: "john@example.com",
      password: "password",
      ip: "fakeIp",
      isMobile: false,
    });

    expect(response).toHaveProperty("token");
  });

  it("should not be able to create a session with unregistered email", async () => {
    await expect(
      createSessionUseCase.execute({
        email: "unregistered-email@example.com",
        password: "password",
        ip: "fakeIp",
        isMobile: false,
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to create a session with wrong password", async () => {
    await expect(
      createSessionUseCase.execute({
        email: "john@example.com",
        password: "wrongPassword",
        ip: "fakeIp",
        isMobile: false,
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should be able to delete a refreshToken if user already have one with same ip", async () => {
    const ip = "fakeIp";

    await createSessionUseCase.execute({
      email: "john@example.com",
      password: "password",
      ip,
      isMobile: false,
    });

    const deleteRefreshTokenSpy = jest.spyOn(
      fakeRefreshTokensRepository,
      "delete"
    );

    await createSessionUseCase.execute({
      email: "john@example.com",
      password: "password",
      ip,
      isMobile: false,
    });

    expect(deleteRefreshTokenSpy).toHaveBeenCalled();
  });

  it("should not be able to create a session if user is not verified", async () => {
    const notVerifiedUser = await createUserUseCase.execute({
      firstName: "John",
      lastName: "Doe",
      email: "john2@example.com",
      password: "password",
      timezoneOffSet: 180,
    });

    await expect(
      createSessionUseCase.execute({
        email: "john2@example.com",
        password: "password",
        ip: "fakeIp",
        isMobile: false,
      })
    ).rejects.toBeInstanceOf(AppError);
  });
});
