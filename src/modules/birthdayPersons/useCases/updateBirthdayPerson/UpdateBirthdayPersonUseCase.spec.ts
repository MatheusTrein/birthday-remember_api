import "reflect-metadata";

import { FakeUsersRepository } from "@modules/accounts/repositories/fakes/FakeUsersRepository";
import { CreateUserUseCase } from "@modules/accounts/useCases/createUser/CreateUserUseCase";
import { IUserResponse } from "@modules/accounts/dtos/IUserResponse";
import { FakeBirthdayPersonsRepository } from "@modules/birthdayPersons/repositories/fakes/FakeBirthdayPersonsRepository";
import { FakeDateProvider } from "@shared/container/Providers/DateProvider/fakes/FakeDateProvider";
import { CreateBirthdayPersonUseCase } from "../createBirthdayPerson/CreateBirthdayPersonUseCase";
import { UpdateBirthdayPersonUseCase } from "./UpdateBirthdayPersonUseCase";
import { AppError } from "@shared/errors/AppError";
import { FakeCacheProvider } from "@shared/container/Providers/CacheProvider/fakes/FakeCacheProvider";
import { FakeQueueProvider } from "@shared/container/Providers/QueueProvider/fakes/FakeQueueProvider";
import { FakeHashProvider } from "@shared/container/Providers/HashProvider/fakes/FakeHashProvider";
import { FakeUserTokensRepository } from "@modules/accounts/repositories/fakes/FakeUserTokensRepository";

let fakeUsersRepository: FakeUsersRepository;
let fakeBirthdayPersonsRepository: FakeBirthdayPersonsRepository;
let fakeUserTokensRepository: FakeUserTokensRepository;
let fakeDateProvider: FakeDateProvider;
let fakeCacheProvider: FakeCacheProvider;
let fakeQueueProvider: FakeQueueProvider;
let fakeHashProvider: FakeHashProvider;
let createUserUseCase: CreateUserUseCase;
let createBirthdayPersonUseCase: CreateBirthdayPersonUseCase;
let updateBirthdayPersonUseCase: UpdateBirthdayPersonUseCase;

let user: IUserResponse;

// jest.mock("tsyringe", () => {
//   const originalModule = jest.requireActual("tsyringe");

//   return {
//     ...originalModule,
//     container: {
//       resolve: jest.fn(() => ({
//         execute: jest.fn(() => {}),
//       })),
//     },
//   };
// });

describe("UpdateBirthdayPersonUseCase", () => {
  beforeEach(async () => {
    fakeUsersRepository = new FakeUsersRepository();
    fakeBirthdayPersonsRepository = new FakeBirthdayPersonsRepository();
    fakeUserTokensRepository = new FakeUserTokensRepository();
    fakeDateProvider = new FakeDateProvider();
    fakeCacheProvider = new FakeCacheProvider();
    fakeQueueProvider = new FakeQueueProvider();
    fakeHashProvider = new FakeHashProvider();
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
    updateBirthdayPersonUseCase = new UpdateBirthdayPersonUseCase(
      fakeUsersRepository,
      fakeBirthdayPersonsRepository,
      fakeDateProvider,
      fakeCacheProvider,
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

  it("should be able to update a birthday person", async () => {
    const { id: birthdayPersonId } = await createBirthdayPersonUseCase.execute({
      name: "Birthday Guy",
      birthDate: new Date(1961, 4, 30).toISOString(),
      userId: user.id,
      alarmTime: "08:00",
    });

    const updatedBirthdayPerson = await updateBirthdayPersonUseCase.execute({
      name: "Birthday Guy Updated",
      birthDate: new Date(1962, 1, 25).toISOString(),
      birthdayPersonId,
      userId: user.id,
      alarmTime: "08:00",
    });

    expect(updatedBirthdayPerson.name).toBe("Birthday Guy Updated");
    expect(updatedBirthdayPerson.birthDate).toStrictEqual(
      new Date(1962, 1, 25)
    );
  });

  it("should be able to invalidate cache of birthday persons from user when birthday person is updated", async () => {
    const { id: birthdayPersonId } = await createBirthdayPersonUseCase.execute({
      name: "Birthday Guy",
      birthDate: new Date(1961, 4, 30).toISOString(),
      userId: user.id,
      alarmTime: "08:00",
    });

    const invalidateSpy = jest.spyOn(fakeCacheProvider, "invalidate");

    await updateBirthdayPersonUseCase.execute({
      name: "Birthday Guy Updated",
      birthDate: new Date(1962, 1, 25).toISOString(),
      birthdayPersonId,
      userId: user.id,
      alarmTime: "08:00",
    });

    expect(invalidateSpy).toHaveBeenCalled();
  });

  it("should not be able to update a birthday person if user was not registered", async () => {
    const { id: birthdayPersonId } = await createBirthdayPersonUseCase.execute({
      name: "Birthday Guy",
      birthDate: new Date(1961, 4, 30).toISOString(),
      userId: user.id,
      alarmTime: "08:00",
    });

    await expect(
      updateBirthdayPersonUseCase.execute({
        name: "Birthday Guy Updated",
        birthDate: new Date(1962, 1, 25).toISOString(),
        birthdayPersonId,
        userId: "non-existing-userId",
        alarmTime: "08:00",
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to update a birthday person if birthday person was not registered", async () => {
    await expect(
      updateBirthdayPersonUseCase.execute({
        name: "Birthday Guy Updated",
        birthDate: new Date(1962, 1, 25).toISOString(),
        birthdayPersonId: "non-existing-birthdayPersonId",
        userId: user.id,
        alarmTime: "08:00",
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to update a birthday person from another user", async () => {
    const user2 = await createUserUseCase.execute({
      firstName: "John",
      lastName: "Doe",
      email: "john2@example.com",
      password: "password",
      timezoneOffSet: 180,
    });

    const { id: birthdayPersonId } = await createBirthdayPersonUseCase.execute({
      name: "Birthday Guy",
      birthDate: new Date(1961, 4, 30).toISOString(),
      userId: user.id,
      alarmTime: "08:00",
    });

    await expect(
      updateBirthdayPersonUseCase.execute({
        name: "Birthday Guy Updated",
        birthDate: new Date(1962, 1, 25).toISOString(),
        birthdayPersonId,
        userId: user2.id,
        alarmTime: "08:00",
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to update a birthday person if birthday person name already exist", async () => {
    await createBirthdayPersonUseCase.execute({
      name: "Birthday Guy",
      birthDate: new Date(1961, 4, 30).toISOString(),
      userId: user.id,
      alarmTime: "08:00",
    });

    const { id: birthdayPersonId } = await createBirthdayPersonUseCase.execute({
      name: "Birthday Guy2",
      birthDate: new Date(1961, 4, 30).toISOString(),
      userId: user.id,
      alarmTime: "08:00",
    });

    await expect(
      updateBirthdayPersonUseCase.execute({
        name: "Birthday Guy",
        birthDate: new Date(1962, 1, 25).toISOString(),
        birthdayPersonId,
        userId: user.id,
        alarmTime: "08:00",
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to update a birthday person from non existing user", async () => {
    const { id: birthdayPersonId } = await createBirthdayPersonUseCase.execute({
      name: "Birthday Guy",
      birthDate: new Date(1961, 4, 30).toISOString(),
      userId: user.id,
      alarmTime: "08:00",
    });

    await expect(
      updateBirthdayPersonUseCase.execute({
        name: "Birthday Guy Updated",
        birthDate: new Date(1962, 1, 25).toISOString(),
        birthdayPersonId,
        userId: "non-existing-userId",
        alarmTime: "08:00",
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should be able to add a new cron job at queue 'ReminderBirthdayMail' and delete the old one", async () => {
    const { id: birthdayPersonId } = await createBirthdayPersonUseCase.execute({
      name: "Birthday Guy",
      birthDate: new Date(1961, 4, 30).toDateString(),
      userId: user.id,
      alarmTime: "08:00",
    });

    const removeJobSpy = jest.spyOn(fakeQueueProvider, "remove");
    const addJobSpy = jest.spyOn(fakeQueueProvider, "add");

    await updateBirthdayPersonUseCase.execute({
      name: "Birthday Guy Updated",
      birthDate: new Date(1962, 1, 25).toISOString(),
      birthdayPersonId,
      userId: user.id,
      alarmTime: "08:00",
    });

    expect(removeJobSpy).toHaveBeenCalled();
    expect(addJobSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "ReminderBirthdayMail",
      })
    );
  });
});
