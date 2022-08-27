import "reflect-metadata";

import { FakeUsersRepository } from "@modules/accounts/repositories/fakes/FakeUsersRepository";
import { CreateUserUseCase } from "@modules/accounts/useCases/createUser/CreateUserUseCase";
import { FakeBirthdayPersonsRepository } from "@modules/birthdayPersons/repositories/fakes/FakeBirthdayPersonsRepository";
import { FakeCacheProvider } from "@shared/container/Providers/CacheProvider/fakes/FakeCacheProvider";
import { CreateBirthdayPersonUseCase } from "../createBirthdayPerson/CreateBirthdayPersonUseCase";
import { FakeDateProvider } from "@shared/container/Providers/DateProvider/fakes/FakeDateProvider";
import { DeleteBirthdayPersonUseCase } from "./DeleteBirthdayPersonUseCase";
import { IUserResponse } from "@modules/accounts/dtos/IUserResponse";
import { BirthdayPerson } from "@modules/birthdayPersons/infra/typeorm/entities/BirthdayPerson";
import { AppError } from "@shared/errors/AppError";
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
let deleteBirthdayPersonUseCase: DeleteBirthdayPersonUseCase;

let user: IUserResponse;
let birthdayPerson: BirthdayPerson;

describe("DeleteBirthdayPersonUseCase", () => {
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
    deleteBirthdayPersonUseCase = new DeleteBirthdayPersonUseCase(
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

    birthdayPerson = await createBirthdayPersonUseCase.execute({
      userId: user.id,
      name: "Birthday Guy",
      birthDate: new Date(1961, 4, 30).toISOString(),
      alarmTime: "08:00",
    });
  });

  it("should be able to delete a birthday person from user", async () => {
    await deleteBirthdayPersonUseCase.execute({
      userId: user.id,
      birthdayPersonId: birthdayPerson.id,
    });

    const findBirthdayPerson = await fakeBirthdayPersonsRepository.findById(
      birthdayPerson.id
    );

    expect(findBirthdayPerson).toBe(null);
  });

  it("should be able to remove cron job of queue 'ReminderBirthdayMail' when user delete a birthday person", async () => {
    const removeJobSpy = jest.spyOn(fakeQueueProvider, "remove");

    await deleteBirthdayPersonUseCase.execute({
      userId: user.id,
      birthdayPersonId: birthdayPerson.id,
    });

    expect(removeJobSpy).toHaveBeenCalled();
  });

  it("should be able to invalidate cache when user delete a birthday person", async () => {
    const invalidateSpy = jest.spyOn(fakeCacheProvider, "invalidate");

    await deleteBirthdayPersonUseCase.execute({
      userId: user.id,
      birthdayPersonId: birthdayPerson.id,
    });

    expect(invalidateSpy).toHaveBeenCalled();
  });

  it("should not be able to delete a birthday person from user if user not exist", async () => {
    await expect(
      deleteBirthdayPersonUseCase.execute({
        userId: "non-existing-user-ID",
        birthdayPersonId: birthdayPerson.id,
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to delete a birthday person from user if birthday person not exist", async () => {
    await expect(
      deleteBirthdayPersonUseCase.execute({
        userId: user.id,
        birthdayPersonId: "non-existing-birhtday-person-ID",
      })
    ).rejects.toBeInstanceOf(AppError);
  });
});
