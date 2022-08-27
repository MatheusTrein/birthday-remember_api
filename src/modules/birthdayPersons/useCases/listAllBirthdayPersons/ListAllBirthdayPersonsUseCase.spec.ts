import "reflect-metadata";

import { IUserResponse } from "@modules/accounts/dtos/IUserResponse";
import { FakeUsersRepository } from "@modules/accounts/repositories/fakes/FakeUsersRepository";
import { CreateUserUseCase } from "@modules/accounts/useCases/createUser/CreateUserUseCase";
import { FakeBirthdayPersonsRepository } from "@modules/birthdayPersons/repositories/fakes/FakeBirthdayPersonsRepository";
import { FakeDateProvider } from "@shared/container/Providers/DateProvider/fakes/FakeDateProvider";
import { CreateBirthdayPersonUseCase } from "../createBirthdayPerson/CreateBirthdayPersonUseCase";
import { ListAllBirthdayPersonsUseCase } from "./ListAllBirthdayPersonsUseCase";
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
let listAllBirthdayPersonsUseCase: ListAllBirthdayPersonsUseCase;

let user: IUserResponse;

describe("ListAllBirthdayPersonsUseCase", () => {
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
    listAllBirthdayPersonsUseCase = new ListAllBirthdayPersonsUseCase(
      fakeUsersRepository,
      fakeBirthdayPersonsRepository,
      fakeCacheProvider
    );

    user = await createUserUseCase.execute({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password",
      timezoneOffSet: 180,
    });
  });

  it("should be able to list all birthdays persons from user", async () => {
    await createBirthdayPersonUseCase.execute({
      name: "Birthday Guy1",
      birthDate: new Date(1961, 4, 30).toDateString(),
      userId: user.id,
      alarmTime: "08:00",
    });

    await createBirthdayPersonUseCase.execute({
      name: "Birthday Guy2",
      birthDate: new Date(1962, 1, 25).toDateString(),
      userId: user.id,
      alarmTime: "08:00",
    });

    await createBirthdayPersonUseCase.execute({
      name: "Birthday Guy3",
      birthDate: new Date(1995, 2, 8).toDateString(),
      userId: user.id,
      alarmTime: "08:00",
    });

    const { birthdayPersons } = await listAllBirthdayPersonsUseCase.execute({
      userId: user.id,
      page: 1,
      perPage: 3,
    });

    expect(birthdayPersons.length).toBe(3);
  });
  it("should be able to save birthday persons in cache if cache is empty", async () => {
    await createBirthdayPersonUseCase.execute({
      name: "Birthday Guy1",
      birthDate: new Date(1961, 4, 30).toDateString(),
      userId: user.id,
      alarmTime: "08:00",
    });

    await createBirthdayPersonUseCase.execute({
      name: "Birthday Guy2",
      birthDate: new Date(1962, 1, 25).toDateString(),
      userId: user.id,
      alarmTime: "08:00",
    });

    await createBirthdayPersonUseCase.execute({
      name: "Birthday Guy3",
      birthDate: new Date(1995, 2, 8).toDateString(),
      userId: user.id,
      alarmTime: "08:00",
    });

    const saveSpy = jest.spyOn(fakeCacheProvider, "save");

    await listAllBirthdayPersonsUseCase.execute({
      userId: user.id,
      page: 1,
      perPage: 3,
    });

    expect(saveSpy).toHaveBeenCalled();
  });
  it("should not be able to list all birthdays persons from user if user id is not registered", async () => {
    await expect(
      listAllBirthdayPersonsUseCase.execute({
        userId: "non-existing-user-ID",
        page: 1,
        perPage: 3,
      })
    ).rejects.toBeInstanceOf(AppError);
  });
});
