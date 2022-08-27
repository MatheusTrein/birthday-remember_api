import "reflect-metadata";

import { FakeUsersRepository } from "@modules/accounts/repositories/fakes/FakeUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { FakeUserTokensRepository } from "@modules/accounts/repositories/fakes/FakeUserTokensRepository";
import { ResetPasswordUseCase } from "./ResetPasswordUseCase";
import { FakeDateProvider } from "@shared/container/Providers/DateProvider/fakes/FakeDateProvider";
import { IUserResponse } from "@modules/accounts/dtos/IUserResponse";
import { UserToken } from "@modules/accounts/infra/typeorm/entities/UserToken";
import { User } from "@modules/accounts/infra/typeorm/entities/User";
import { AppError } from "@shared/errors/AppError";
import { FakeHashProvider } from "@shared/container/Providers/HashProvider/fakes/FakeHashProvider";
import { FakeQueueProvider } from "@shared/container/Providers/QueueProvider/fakes/FakeQueueProvider";
import { VerifyUserUseCase } from "../verifyUser/VerifyUserUseCase";

let fakeUsersRepository: FakeUsersRepository;
let fakeUserTokensRepository: FakeUserTokensRepository;
let fakeQueueProvider: FakeQueueProvider;
let fakeHashProvider: FakeHashProvider;
let fakeDateProvider: FakeDateProvider;
let createUserUseCase: CreateUserUseCase;
let verifyUserUseCase: VerifyUserUseCase;
let resetPasswordUseCase: ResetPasswordUseCase;

let user: IUserResponse;

describe("ResetPasswordUseCase", () => {
  beforeEach(async () => {
    fakeUsersRepository = new FakeUsersRepository();
    fakeUserTokensRepository = new FakeUserTokensRepository();
    fakeQueueProvider = new FakeQueueProvider();
    fakeDateProvider = new FakeDateProvider();
    fakeHashProvider = new FakeHashProvider();
    createUserUseCase = new CreateUserUseCase(
      fakeUsersRepository,
      fakeHashProvider,
      fakeUserTokensRepository,
      fakeQueueProvider
    );
    resetPasswordUseCase = new ResetPasswordUseCase(
      fakeUserTokensRepository,
      fakeUsersRepository,
      fakeDateProvider,
      fakeHashProvider
    );
    verifyUserUseCase = new VerifyUserUseCase(
      fakeUsersRepository,
      fakeUserTokensRepository
    );

    user = await createUserUseCase.execute({
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

  it("should be able to reset password with a valid user token", async () => {
    const outdatedUser = (await fakeUsersRepository.findById(user.id)) as User;

    const outdatedPassword = outdatedUser.password;

    const tokenExpiresIn = fakeDateProvider.addMinutes(new Date(), 2 * 60); // 2 hours

    await fakeUserTokensRepository.generate({
      userId: user.id,
      type: "forgotPasswordUserToken",
      expiresIn: tokenExpiresIn,
    });

    const userToken = (await fakeUserTokensRepository.findByUserIdAndType(
      user.id,
      "forgotPasswordUserToken"
    )) as UserToken;

    await resetPasswordUseCase.execute({
      token: userToken.token,
      password: "passwordUpdated",
    });

    const updatedUser = (await fakeUsersRepository.findById(user.id)) as User;

    const updatedPassword = updatedUser.password;

    expect(outdatedPassword).not.toEqual(updatedPassword);
  });

  it("should not be able to reset password with a non-existing user", async () => {
    const fakeUserId = "c07ca8e2-bd63-411a-a614-a9133060a825";

    const tokenExpiresIn = fakeDateProvider.addMinutes(new Date(), 2 * 60); // 2 hours

    await fakeUserTokensRepository.generate({
      userId: fakeUserId,
      type: "forgotPasswordUserToken",
      expiresIn: tokenExpiresIn,
    });

    const userToken = (await fakeUserTokensRepository.findByUserIdAndType(
      fakeUserId,
      "forgotPasswordUserToken"
    )) as UserToken;

    await expect(
      resetPasswordUseCase.execute({
        token: userToken.token,
        password: "passwordUpdated",
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to reset password with a non-existing user token", async () => {
    await expect(
      resetPasswordUseCase.execute({
        token: "invalidToken",
        password: "passwordUpdated",
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to reset password with a expired user token", async () => {
    const tokenExpiresIn = fakeDateProvider.addMinutes(new Date(), 2 * 60); // 2 hours

    await fakeUserTokensRepository.generate({
      userId: user.id,
      type: "forgotPasswordUserToken",
      expiresIn: tokenExpiresIn,
    });

    const userToken = (await fakeUserTokensRepository.findByUserIdAndType(
      user.id,
      "forgotPasswordUserToken"
    )) as UserToken;

    jest.spyOn(Date, "now").mockImplementationOnce(() => {
      const customDate = new Date();
      const currentHour = customDate.getHours();

      customDate.setHours(currentHour + 3);

      return customDate.getTime();
    });

    await expect(
      resetPasswordUseCase.execute({
        token: userToken.token,
        password: "passwordUpdated",
      })
    ).rejects.toBeInstanceOf(AppError);
  });
});
