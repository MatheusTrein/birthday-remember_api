import "reflect-metadata";

import authConfig from "@config/auth";

import { FakeRefreshTokensRepository } from "@modules/accounts/repositories/fakes/FakeRefreshTokensRepository";
import { FakeUsersRepository } from "@modules/accounts/repositories/fakes/FakeUsersRepository";
import { FakeDateProvider } from "@shared/container/Providers/DateProvider/fakes/FakeDateProvider";
import { CreateSessionUseCase } from "../createSession/CreateSessionUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { RefreshSessionUseCase } from "./RefreshSessionUseCase";
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
let refreshSessionUseCase: RefreshSessionUseCase;
let verifyUserUseCase: VerifyUserUseCase;

describe("RefreshSessionUseCase", () => {
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
    refreshSessionUseCase = new RefreshSessionUseCase(
      fakeUsersRepository,
      fakeRefreshTokensRepository,
      fakeDateProvider,
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

  it("should be able to refresh session with refresh token available", async () => {
    const { refreshToken } = await createSessionUseCase.execute({
      email: "john@example.com",
      password: "password",
      ip: "fakeIp",
      isMobile: false,
    });

    const response = await refreshSessionUseCase.execute(refreshToken);

    expect(response).toHaveProperty("refreshToken");
  });

  it("should not be able to refresh sesion with a invalid refresh token", async () => {
    await expect(
      refreshSessionUseCase.execute("invalid-refresh-token")
    ).rejects.toEqual(
      expect.objectContaining({ type: "refreshToken.invalid" })
    );
  });

  it("should not be able to refresh sesion with a expired refresh token", async () => {
    const { refreshToken } = await createSessionUseCase.execute({
      email: "john@example.com",
      password: "password",
      ip: "fakeIp",
      isMobile: false,
    });

    jest.spyOn(fakeDateProvider, "now").mockImplementationOnce(() => {
      const today = new Date();
      today.setDate(today.getDate() + authConfig.refreshTokenExpiresInDays + 1);
      return today;
    });

    await expect(refreshSessionUseCase.execute(refreshToken)).rejects.toEqual(
      expect.objectContaining({ type: "refreshToken.expired" })
    );
  });
});
