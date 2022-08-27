import "reflect-metadata";

import { FakeUsersRepository } from "@modules/accounts/repositories/fakes/FakeUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { SendForgotPasswordMailUseCase } from "./SendForgotPasswordMailUseCase";
import { FakeUserTokensRepository } from "@modules/accounts/repositories/fakes/FakeUserTokensRepository";
import { FakeDateProvider } from "@shared/container/Providers/DateProvider/fakes/FakeDateProvider";
import { FakeMailProvider } from "@shared/container/Providers/MailProvider/fakes/FakeMailProvider";
import { IUserResponse } from "@modules/accounts/dtos/IUserResponse";
import { AppError } from "@shared/errors/AppError";
import { FakeQueueProvider } from "@shared/container/Providers/QueueProvider/fakes/FakeQueueProvider";
import { FakeHashProvider } from "@shared/container/Providers/HashProvider/fakes/FakeHashProvider";

let fakeUsersRepository: FakeUsersRepository;
let fakeUserTokensRepository: FakeUserTokensRepository;
let fakeDateProvider: FakeDateProvider;
let fakeQueueProvider: FakeQueueProvider;
let fakeHashProvider: FakeHashProvider;
let createUserUseCase: CreateUserUseCase;
let sendForgotPasswordMailUseCase: SendForgotPasswordMailUseCase;

let user: IUserResponse;

describe("SendForgotPasswordMailUseCase", () => {
  beforeEach(async () => {
    fakeUsersRepository = new FakeUsersRepository();
    fakeUserTokensRepository = new FakeUserTokensRepository();
    fakeDateProvider = new FakeDateProvider();
    fakeQueueProvider = new FakeQueueProvider();
    fakeHashProvider = new FakeHashProvider();
    createUserUseCase = new CreateUserUseCase(
      fakeUsersRepository,
      fakeHashProvider,
      fakeUserTokensRepository,
      fakeQueueProvider
    );
    sendForgotPasswordMailUseCase = new SendForgotPasswordMailUseCase(
      fakeUsersRepository,
      fakeUserTokensRepository,
      fakeDateProvider,
      fakeQueueProvider
    );

    user = await createUserUseCase.execute({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password",
      timezoneOffSet: 180,
    });
  });

  it("should be able to add job in queue 'SendForgotPasswordMail' if user email exist", async () => {
    const addJobSpy = jest.spyOn(fakeQueueProvider, "add");

    await sendForgotPasswordMailUseCase.execute({ email: user.email });

    expect(addJobSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "SendForgotPasswordMail",
      })
    );
  });

  it("should be able to delete a token from user if user already an token", async () => {
    await sendForgotPasswordMailUseCase.execute({ email: user.email });

    const deleteSpy = jest.spyOn(fakeUserTokensRepository, "delete");

    await sendForgotPasswordMailUseCase.execute({ email: user.email });

    expect(deleteSpy).toHaveBeenCalled();
  });

  it("should not be able to send a forgot password mail if user email is not exist", async () => {
    await expect(
      sendForgotPasswordMailUseCase.execute({
        email: "non-registered-email@example.com",
      })
    ).rejects.toBeInstanceOf(AppError);
  });
});
