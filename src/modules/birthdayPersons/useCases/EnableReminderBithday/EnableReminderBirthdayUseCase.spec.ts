import "reflect-metadata";

import { FakeUsersRepository } from "@modules/accounts/repositories/fakes/FakeUsersRepository";
import { CreateUserUseCase } from "@modules/accounts/useCases/createUser/CreateUserUseCase";
import { CreateBirthdayPersonUseCase } from "../createBirthdayPerson/CreateBirthdayPersonUseCase";
import { FakeBirthdayPersonsRepository } from "@modules/birthdayPersons/repositories/fakes/FakeBirthdayPersonsRepository";
import { FakeDateProvider } from "@shared/container/Providers/DateProvider/fakes/FakeDateProvider";
import { FakeCacheProvider } from "@shared/container/Providers/CacheProvider/fakes/FakeCacheProvider";
import { FakeQueueProvider } from "@shared/container/Providers/QueueProvider/fakes/FakeQueueProvider";
import { IUserResponse } from "@modules/accounts/dtos/IUserResponse";
import { DisableReminderBirthdayUseCase } from "../disableReminderBirthday/DisableReminderBirthdayUseCase";
import { EnableReminderBirthdayUseCase } from "./EnableReminderBirthdayUseCase";
import { AppError } from "@shared/errors/AppError";
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
let enableReminderBirthdayUseCase: EnableReminderBirthdayUseCase;

let user: IUserResponse;

describe("EnableReminderBirthdayUseCase", () => {
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
    enableReminderBirthdayUseCase = new EnableReminderBirthdayUseCase(
      fakeUsersRepository,
      fakeBirthdayPersonsRepository,
      fakeCacheProvider,
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

  it("should be able to enable a reminder of birthday person from user", async () => {
    const { id: birthdayPersonId, ...rest } =
      await createBirthdayPersonUseCase.execute({
        name: "Birthday Guy",
        birthDate: new Date(1961, 4, 30).toISOString(),
        userId: user.id,
        alarmTime: "08:00",
      });

    await disableReminderBirthdayUseCase.execute({
      userId: user.id,
      birthdayPersonId,
    });

    const birthdayPerson = await enableReminderBirthdayUseCase.execute({
      userId: user.id,
      birthdayPersonId,
    });

    expect(birthdayPerson).toHaveProperty("reminderIsActive", true);
  });

  it("should not be able to enable a reminder of birthday person if user is not registered", async () => {
    const { id: birthdayPersonId } = await createBirthdayPersonUseCase.execute({
      name: "Birthday Guy",
      birthDate: new Date(1961, 4, 30).toISOString(),
      userId: user.id,
      alarmTime: "08:00",
    });

    await disableReminderBirthdayUseCase.execute({
      userId: user.id,
      birthdayPersonId,
    });

    await expect(
      enableReminderBirthdayUseCase.execute({
        userId: "non-existing-user-ID",
        birthdayPersonId,
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to enable a reminder of birthday person if birthday person is not registered", async () => {
    const { id: birthdayPersonId } = await createBirthdayPersonUseCase.execute({
      name: "Birthday Guy",
      birthDate: new Date(1961, 4, 30).toISOString(),
      userId: user.id,
      alarmTime: "08:00",
    });

    await disableReminderBirthdayUseCase.execute({
      userId: user.id,
      birthdayPersonId,
    });

    await expect(
      enableReminderBirthdayUseCase.execute({
        userId: user.id,
        birthdayPersonId: "non-existing-birthday-person-ID",
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to enable reminder birthday if this was created by another user", async () => {
    const anotherUser = await createUserUseCase.execute({
      firstName: "Another",
      lastName: "User",
      email: "anotheruser@email.com",
      password: "password",
      timezoneOffSet: 180,
    });

    const { id: birthdayPersonId } = await createBirthdayPersonUseCase.execute({
      name: "Birthday Guy",
      birthDate: new Date(1961, 4, 30).toISOString(),
      userId: anotherUser.id,
      alarmTime: "08:00",
    });

    await disableReminderBirthdayUseCase.execute({
      userId: anotherUser.id,
      birthdayPersonId,
    });

    await expect(
      enableReminderBirthdayUseCase.execute({
        userId: user.id,
        birthdayPersonId,
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to enable a reminder of birthday person if reminder is already enabled", async () => {
    const { id: birthdayPersonId } = await createBirthdayPersonUseCase.execute({
      name: "Birthday Guy",
      birthDate: new Date(1961, 4, 30).toISOString(),
      userId: user.id,
      alarmTime: "08:00",
    });

    await expect(
      enableReminderBirthdayUseCase.execute({
        userId: user.id,
        birthdayPersonId,
      })
    ).rejects.toBeInstanceOf(AppError);
  });
});
