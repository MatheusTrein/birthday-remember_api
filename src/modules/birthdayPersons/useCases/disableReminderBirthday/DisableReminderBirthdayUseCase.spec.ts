import "reflect-metadata";

import { FakeUsersRepository } from "@modules/accounts/repositories/fakes/FakeUsersRepository";
import { CreateUserUseCase } from "@modules/accounts/useCases/createUser/CreateUserUseCase";
import { FakeBirthdayPersonsRepository } from "@modules/birthdayPersons/repositories/fakes/FakeBirthdayPersonsRepository";
import { FakeDateProvider } from "@shared/container/Providers/DateProvider/fakes/FakeDateProvider";
import { CreateBirthdayPersonUseCase } from "../createBirthdayPerson/CreateBirthdayPersonUseCase";
import { DisableReminderBirthdayUseCase } from "./DisableReminderBirthdayUseCase";
import { IUserResponse } from "@modules/accounts/dtos/IUserResponse";
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
let disableReminderBirthdayUseCase: DisableReminderBirthdayUseCase;

let user: IUserResponse;

describe("DisableReminderBirthdayUseCase", () => {
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
    disableReminderBirthdayUseCase = new DisableReminderBirthdayUseCase(
      fakeUsersRepository,
      fakeBirthdayPersonsRepository,
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

  it("should be able to disable reminder birthday", async () => {
    const { id: birthdayPersonId } = await createBirthdayPersonUseCase.execute({
      name: "Birthday Guy",
      birthDate: new Date(1961, 30, 4).toDateString(),
      userId: user.id,
      alarmTime: "08:00",
    });

    await disableReminderBirthdayUseCase.execute({
      birthdayPersonId,
      userId: user.id,
    });

    const birthdayPerson = await fakeBirthdayPersonsRepository.listOne(
      birthdayPersonId
    );

    expect(birthdayPerson?.reminderIsActive).toBe(false);
  });

  it("should be able to invalidate cache of birthday persons from user when user disable reminder birthday", async () => {
    const { id: birthdayPersonId } = await createBirthdayPersonUseCase.execute({
      name: "Birthday Guy",
      birthDate: new Date(1961, 30, 4).toDateString(),
      userId: user.id,
      alarmTime: "08:00",
    });

    const invalidateSpy = jest.spyOn(fakeCacheProvider, "invalidate");

    await disableReminderBirthdayUseCase.execute({
      birthdayPersonId,
      userId: user.id,
    });

    expect(invalidateSpy).toHaveBeenCalled();
  });

  it("should be able to remove cron job of queue 'ReminderBirthdayMail' when user disable a reminder of birthday person", async () => {
    const { id: birthdayPersonId } = await createBirthdayPersonUseCase.execute({
      name: "Birthday Guy",
      birthDate: new Date(1961, 30, 4).toDateString(),
      userId: user.id,
      alarmTime: "08:00",
    });

    const removeJobSpy = jest.spyOn(fakeQueueProvider, "remove");

    await disableReminderBirthdayUseCase.execute({
      userId: user.id,
      birthdayPersonId,
    });

    expect(removeJobSpy).toHaveBeenCalled();
  });

  it("should not be able to disable reminder birthday if user not exist", async () => {
    await expect(
      disableReminderBirthdayUseCase.execute({
        birthdayPersonId: "wrongId",
        userId: "non-existing-user-ID",
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to disable reminder birthday if birthday person it not registered", async () => {
    await expect(
      disableReminderBirthdayUseCase.execute({
        birthdayPersonId: "wrongId",
        userId: user.id,
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to disable reminder birthday if birthday person reminder is already disabled", async () => {
    const { id: birthdayPersonId } = await createBirthdayPersonUseCase.execute({
      name: "Birthday Guy",
      birthDate: new Date(1961, 30, 4).toDateString(),
      userId: user.id,
      alarmTime: "08:00",
    });

    await disableReminderBirthdayUseCase.execute({
      userId: user.id,
      birthdayPersonId,
    });

    await expect(
      disableReminderBirthdayUseCase.execute({
        birthdayPersonId,
        userId: user.id,
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to disable reminder birthday if this was created by another user", async () => {
    const user2 = await createUserUseCase.execute({
      firstName: "John",
      lastName: "Doe2",
      email: "john2@example.com",
      password: "password",
      timezoneOffSet: 180,
    });

    const { id: birthdayPersonId } = await createBirthdayPersonUseCase.execute({
      name: "Birthday Guy",
      birthDate: new Date(1961, 30, 4).toDateString(),
      userId: user.id,
      alarmTime: "08:00",
    });

    await expect(
      disableReminderBirthdayUseCase.execute({
        birthdayPersonId,
        userId: user2.id,
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to disable reminder birthday if this was created by another user", async () => {
    const user2 = await createUserUseCase.execute({
      firstName: "John",
      lastName: "Doe2",
      email: "john2@example.com",
      password: "password",
      timezoneOffSet: 180,
    });

    const { id: birthdayPersonId } = await createBirthdayPersonUseCase.execute({
      name: "Birthday Guy",
      birthDate: new Date(1961, 30, 4).toDateString(),
      userId: user.id,
      alarmTime: "08:00",
    });

    await expect(
      disableReminderBirthdayUseCase.execute({
        birthdayPersonId,
        userId: user2.id,
      })
    ).rejects.toBeInstanceOf(AppError);
  });
});
