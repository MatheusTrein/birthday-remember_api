import "reflect-metadata";

import { FakeUsersRepository } from "@modules/accounts/repositories/fakes/FakeUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { FakeHashProvider } from "@shared/container/Providers/HashProvider/fakes/FakeHashProvider";
import { FakeUserTokensRepository } from "@modules/accounts/repositories/fakes/FakeUserTokensRepository";
import { FakeQueueProvider } from "@shared/container/Providers/QueueProvider/fakes/FakeQueueProvider";
import { VerifyUserUseCase } from "./VerifyUserUseCase";
import { AppError } from "@shared/errors/AppError";

let fakeUsersRepository: FakeUsersRepository;
let fakeHashProvider: FakeHashProvider;
let fakeUserTokensRepository: FakeUserTokensRepository;
let fakeQueueProvider: FakeQueueProvider;
let createUserUseCase: CreateUserUseCase;
let verifyUserUseCase: VerifyUserUseCase;

describe("VerifyUserUseCase", () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository();
    fakeHashProvider = new FakeHashProvider();
    fakeUserTokensRepository = new FakeUserTokensRepository();
    fakeQueueProvider = new FakeQueueProvider();
    createUserUseCase = new CreateUserUseCase(
      fakeUsersRepository,
      fakeHashProvider,
      fakeUserTokensRepository,
      fakeQueueProvider
    );
    verifyUserUseCase = new VerifyUserUseCase(
      fakeUsersRepository,
      fakeUserTokensRepository
    );
  });

  it("should be able to verify user", async () => {
    const user = await createUserUseCase.execute({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password",
      timezoneOffSet: 180,
    });

    const verifyUserToken = await fakeUserTokensRepository.findByUserIdAndType(
      user.id,
      "verifyUserToken"
    );

    await verifyUserUseCase.execute(verifyUserToken?.token as string);

    const verifiedUser = await fakeUsersRepository.findById(user.id);

    expect(verifiedUser).toHaveProperty("isVerified", true);
  });

  it("should not be able to verify user if token non-existing", async () => {
    await createUserUseCase.execute({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password",
      timezoneOffSet: 180,
    });

    await expect(
      verifyUserUseCase.execute("non-existing-token")
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to verify user if non-existing", async () => {
    const verifyUserToken = await fakeUserTokensRepository.generate({
      type: "verifyUserToken",
      userId: "non-existing-user-ID",
    });

    await expect(
      verifyUserUseCase.execute(verifyUserToken.token)
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to verify user if user is already verified", async () => {
    const user = await createUserUseCase.execute({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password",
      timezoneOffSet: 180,
    });

    const verifyUserToken = await fakeUserTokensRepository.findByUserIdAndType(
      user.id,
      "verifyUserToken"
    );

    await verifyUserUseCase.execute(verifyUserToken?.token as string);

    await expect(
      verifyUserUseCase.execute(verifyUserToken?.token as string)
    ).rejects.toBeInstanceOf(AppError);
  });
});
