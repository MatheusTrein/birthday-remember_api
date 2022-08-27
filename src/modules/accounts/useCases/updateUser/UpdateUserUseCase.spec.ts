import "reflect-metadata";

import { IUserResponse } from "@modules/accounts/dtos/IUserResponse";
import { FakeUsersRepository } from "@modules/accounts/repositories/fakes/FakeUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { UpdateUserUseCase } from "../updateUser/UpdateUserUseCase";
import { FakeStorageProvider } from "@shared/container/Providers/StorageProvider/fakes/FakeStorageProvider";
import { AppError } from "@shared/errors/AppError";
import { FakeHashProvider } from "@shared/container/Providers/HashProvider/fakes/FakeHashProvider";
import { FakeQueueProvider } from "@shared/container/Providers/QueueProvider/fakes/FakeQueueProvider";
import { FakeDateProvider } from "@shared/container/Providers/DateProvider/fakes/FakeDateProvider";
import { FakeBirthdayPersonsRepository } from "@modules/birthdayPersons/repositories/fakes/FakeBirthdayPersonsRepository";
import { CreateBirthdayPersonUseCase } from "@modules/birthdayPersons/useCases/createBirthdayPerson/CreateBirthdayPersonUseCase";
import { FakeCacheProvider } from "@shared/container/Providers/CacheProvider/fakes/FakeCacheProvider";
import { FakeUserTokensRepository } from "@modules/accounts/repositories/fakes/FakeUserTokensRepository";

let fakeUsersRepository: FakeUsersRepository;
let fakeUserTokensRepository: FakeUserTokensRepository;
let fakeBirthdayPersonsRepository: FakeBirthdayPersonsRepository;
let fakeStorageProvider: FakeStorageProvider;
let fakeHashProvider: FakeHashProvider;
let fakeQueueProvider: FakeQueueProvider;
let fakeDateProvider: FakeDateProvider;
let fakeCacheProvider: FakeCacheProvider;
let createUserUseCase: CreateUserUseCase;
let createBirthdayPersonUseCase: CreateBirthdayPersonUseCase;
let updateUserUseCase: UpdateUserUseCase;

let user: IUserResponse;

describe("UpdateUserUseCase", () => {
  beforeEach(async () => {
    fakeUsersRepository = new FakeUsersRepository();
    fakeUserTokensRepository = new FakeUserTokensRepository();
    fakeBirthdayPersonsRepository = new FakeBirthdayPersonsRepository();
    fakeStorageProvider = new FakeStorageProvider();
    fakeHashProvider = new FakeHashProvider();
    fakeQueueProvider = new FakeQueueProvider();
    fakeDateProvider = new FakeDateProvider();
    fakeCacheProvider = new FakeCacheProvider();
    createUserUseCase = new CreateUserUseCase(
      fakeUsersRepository,
      fakeHashProvider,
      fakeUserTokensRepository,
      fakeQueueProvider
    );
    createBirthdayPersonUseCase = new CreateBirthdayPersonUseCase(
      fakeUsersRepository,
      fakeBirthdayPersonsRepository,
      fakeDateProvider,
      fakeCacheProvider,
      fakeQueueProvider
    );
    updateUserUseCase = new UpdateUserUseCase(
      fakeUsersRepository,
      fakeBirthdayPersonsRepository,
      fakeStorageProvider,
      fakeHashProvider,
      fakeQueueProvider,
      fakeDateProvider
    );

    user = await createUserUseCase.execute({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password",
      timezoneOffSet: 180,
    });
  });

  it("should be able to update user", async () => {
    const fileName = "don.jpg";

    const updatedUser = await updateUserUseCase.execute({
      firstName: "User",
      lastName: "Updated",
      timezoneOffSet: 240,
      userId: user.id,
      oldPassword: "password",
      newPassword: "passwordUpdated",
      avatar: fileName,
    });

    expect(updatedUser).toEqual(
      expect.objectContaining({
        firstName: "User",
        lastName: "Updated",
        timezoneOffSet: 240,
      })
    );
  });

  it("should be able to update all reminder birthdays if user update the timezone off set", async () => {
    const listAllActiveBirthdayFromUserSpy = jest.spyOn(
      fakeBirthdayPersonsRepository,
      "listAllActiveByUser"
    );
    const removeJobSpy = jest.spyOn(fakeQueueProvider, "remove");
    const addJobSpy = jest.spyOn(fakeQueueProvider, "add");

    const fileName = "don.jpg";

    await createBirthdayPersonUseCase.execute({
      name: "Birthday Guy",
      birthDate: new Date(1961, 4, 30).toISOString(),
      alarmTime: "08:00",
      userId: user.id,
    });

    await updateUserUseCase.execute({
      firstName: "User",
      lastName: "Updated",
      timezoneOffSet: 240,
      userId: user.id,
      oldPassword: "password",
      newPassword: "passwordUpdated",
      avatar: fileName,
    });

    expect(listAllActiveBirthdayFromUserSpy).toHaveBeenCalled();
    expect(removeJobSpy).toHaveBeenCalled();
    expect(addJobSpy).toHaveBeenCalled();
  });

  it("should not be able to update user if user id is not registered", async () => {
    await expect(
      updateUserUseCase.execute({
        firstName: "User",
        lastName: "Updated",
        timezoneOffSet: 240,
        userId: "non-registered-userID",
        oldPassword: "password",
        newPassword: "passwordUpdated",
        avatar: "test",
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to update user if newPassword is informated and oldPassword is not", async () => {
    await expect(
      updateUserUseCase.execute({
        firstName: "User",
        lastName: "Updated",
        timezoneOffSet: 240,
        userId: user.id,
        newPassword: "passwordUpdated",
        avatar: "test",
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to update user if oldPassword and newPassword is informated but oldPassword does not match with current password", async () => {
    await expect(
      updateUserUseCase.execute({
        firstName: "User",
        lastName: "Updated",
        timezoneOffSet: 240,
        userId: user.id,
        oldPassword: "incorrectOldPassword",
        newPassword: "passwordUpdated",
        avatar: "test",
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should be able to update avatar and delete old avatar if user have one", async () => {
    const fileName = "don.jpg";

    await updateUserUseCase.execute({
      firstName: "User",
      lastName: "Updated",
      timezoneOffSet: 240,
      userId: user.id,
      oldPassword: "password",
      newPassword: "passwordUpdated",
      avatar: fileName,
    });

    const deleteFileSpy = jest.spyOn(fakeStorageProvider, "deleteFile");

    const updateUser = await updateUserUseCase.execute({
      firstName: "User",
      lastName: "Updated",
      timezoneOffSet: 240,
      userId: user.id,
      oldPassword: "passwordUpdated",
      newPassword: "passwordUpdated2",
      avatar: "updatedAvatar.jpg",
    });

    expect(deleteFileSpy).toHaveBeenCalled();
    expect(updateUser).toEqual(
      expect.objectContaining({
        firstName: "User",
        lastName: "Updated",
        timezoneOffSet: 240,
      })
    );
  });
});
