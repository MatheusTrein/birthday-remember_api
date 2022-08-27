import "reflect-metadata";

import { IUserResponse } from "@modules/accounts/dtos/IUserResponse";
import { FakeUsersRepository } from "@modules/accounts/repositories/fakes/FakeUsersRepository";
import { CreateUserUseCase } from "@modules/accounts/useCases/createUser/CreateUserUseCase";
import { FakeBirthdayPersonsRepository } from "@modules/birthdayPersons/repositories/fakes/FakeBirthdayPersonsRepository";
import { CreateBirthdayPersonUseCase } from "./CreateBirthdayPersonUseCase";
import { AppError } from "@shared/errors/AppError";
import { FakeDateProvider } from "@shared/container/Providers/DateProvider/fakes/FakeDateProvider";
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

describe("CreateBirthdayPersonUseCase", () => {
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

    user = await createUserUseCase.execute({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password",
      timezoneOffSet: 180,
    });
  });

  it("should be able to create a birthday person", async () => {
    const birthdayPerson = await createBirthdayPersonUseCase.execute({
      name: "Birthday Guy",
      birthDate: new Date(1961, 4, 30).toDateString(),
      userId: user.id,
      alarmTime: "08:00",
    });

    expect(birthdayPerson).toHaveProperty("id");
  });

  it("should be able to invalidade cache of birthday persosn from user when user create a birthday person", async () => {
    const invalidateSpy = jest.spyOn(fakeCacheProvider, "invalidate");

    await createBirthdayPersonUseCase.execute({
      name: "Birthday Guy",
      birthDate: new Date(1961, 4, 30).toDateString(),
      userId: user.id,
      alarmTime: "08:00",
    });

    expect(invalidateSpy).toHaveBeenCalled();
  });

  it("should not be able to create a birthday person if user does not exist", async () => {
    await expect(
      createBirthdayPersonUseCase.execute({
        name: "Birthday Guy",
        birthDate: new Date(1961, 4, 30).toDateString(),
        userId: "non-existing-ID",
        alarmTime: "08:00",
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to create a birthday person if birthday person name already exist", async () => {
    await createBirthdayPersonUseCase.execute({
      name: "Birthday Guy",
      birthDate: new Date(1961, 4, 30).toDateString(),
      userId: user.id,
      alarmTime: "08:00",
    });

    await expect(
      createBirthdayPersonUseCase.execute({
        name: "Birthday Guy",
        birthDate: new Date(1961, 4, 30).toDateString(),
        userId: user.id,
        alarmTime: "08:00",
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should be able to create a add one job to queue 'ReminderBirthdayMail' with a cron to reminder user", async () => {
    const fakeQueueProviderSpy = jest.spyOn(fakeQueueProvider, "add");

    await createBirthdayPersonUseCase.execute({
      name: "Birthday Guy",
      birthDate: new Date(1961, 4, 30).toDateString(),
      userId: user.id,
      alarmTime: "08:00",
    });

    expect(fakeQueueProviderSpy).toHaveBeenCalledWith(
      expect.objectContaining({})
    );
  });
});
