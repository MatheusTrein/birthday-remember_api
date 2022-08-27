import "reflect-metadata";

import { FakeUsersRepository } from "@modules/accounts/repositories/fakes/FakeUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { UpdateAvatarUseCase } from "./UpdateAvatarUseCase";
import { FakeStorageProvider } from "@shared/container/Providers/StorageProvider/fakes/FakeStorageProvider";
import { IUserResponse } from "@modules/accounts/dtos/IUserResponse";
import { AppError } from "@shared/errors/AppError";
import { FakeHashProvider } from "@shared/container/Providers/HashProvider/fakes/FakeHashProvider";
import { FakeUserTokensRepository } from "@modules/accounts/repositories/fakes/FakeUserTokensRepository";
import { FakeQueueProvider } from "@shared/container/Providers/QueueProvider/fakes/FakeQueueProvider";

let fakeUsersRepository: FakeUsersRepository;
let fakeUserTokensRepository: FakeUserTokensRepository;
let fakeQueueProvider: FakeQueueProvider;
let fakeStorageProvider: FakeStorageProvider;
let fakeHashProvider: FakeHashProvider;
let createUserUseCase: CreateUserUseCase;
let updateAvatarUseCase: UpdateAvatarUseCase;

let user: IUserResponse;

describe("UpdateAvatarUseCase", () => {
  beforeEach(async () => {
    fakeUsersRepository = new FakeUsersRepository();
    fakeUserTokensRepository = new FakeUserTokensRepository();
    fakeQueueProvider = new FakeQueueProvider();
    fakeStorageProvider = new FakeStorageProvider();
    fakeHashProvider = new FakeHashProvider();
    createUserUseCase = new CreateUserUseCase(
      fakeUsersRepository,
      fakeHashProvider,
      fakeUserTokensRepository,
      fakeQueueProvider
    );
    updateAvatarUseCase = new UpdateAvatarUseCase(
      fakeUsersRepository,
      fakeStorageProvider
    );

    user = await createUserUseCase.execute({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password",
      timezoneOffSet: 180,
    });
  });

  it("should be able to update the avatar of user", async () => {
    const response = await updateAvatarUseCase.execute({
      fileName: "fakeImg.jpg",
      userId: user.id,
    });

    expect(response.avatarUrl).not.toBe(null);
  });

  it("should not be able to update the avatar of non-existing user", async () => {
    await expect(
      updateAvatarUseCase.execute({
        fileName: "fakeImg.jpg",
        userId: "not-registered-ID",
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should be able to delete the old avatar of user before updating", async () => {
    await updateAvatarUseCase.execute({
      fileName: "fakeImg.jpg",
      userId: user.id,
    });

    const deleteFileSpy = jest.spyOn(fakeStorageProvider, "deleteFile");

    await updateAvatarUseCase.execute({
      fileName: "fakeImg2.jpg",
      userId: user.id,
    });

    expect(deleteFileSpy).toHaveBeenCalled();
  });
});
