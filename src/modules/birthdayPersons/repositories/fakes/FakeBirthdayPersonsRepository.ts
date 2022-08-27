import { v4 as uuidV4 } from "uuid";

import { ICreateBirthdayPerson } from "@modules/birthdayPersons/dtos/ICreateBirthdayPerson";
import { BirthdayPerson } from "@modules/birthdayPersons/infra/typeorm/entities/BirthdayPerson";
import { IBirthdayPersonsRepository } from "../IBirthdayPersonsRepository";
import { IFindBirthdayPersonByNameAndUserId } from "@modules/birthdayPersons/dtos/IFindBirthdayPersonByNameAndUserId";

class FakeBirthdayPersonsRepository implements IBirthdayPersonsRepository {
  private fakeRepository: BirthdayPerson[];

  constructor() {
    this.fakeRepository = [];
  }

  async create({
    userId,
    ...data
  }: ICreateBirthdayPerson): Promise<BirthdayPerson> {
    const birthdayPerson = {} as BirthdayPerson;

    Object.assign(birthdayPerson, {
      id: uuidV4(),
      name: data.name,
      birthDate: new Date(data.birthDate),
      userId,
      reminderIsActive: true,
      alarmTime: data.alarmTime,
      createdAt: new Date(),
    } as BirthdayPerson);

    this.fakeRepository.push(birthdayPerson);

    return birthdayPerson;
  }

  async listOne(birthdayPersonId: string): Promise<BirthdayPerson | null> {
    const birthdayPerson =
      this.fakeRepository.find(
        (birthdayPerson) => birthdayPerson.id === birthdayPersonId
      ) || null;

    return birthdayPerson;
  }

  async save(data: BirthdayPerson): Promise<BirthdayPerson> {
    const birthdayPersonIndex = this.fakeRepository.findIndex(
      (birthdayPerson) => birthdayPerson.id === data.id
    ) as number;

    this.fakeRepository[birthdayPersonIndex] = data;

    return data;
  }

  async listAllByUser(userId: string): Promise<BirthdayPerson[]> {
    const birthdayPersons = this.fakeRepository.filter(
      (birthdayPerson) => birthdayPerson.userId === userId
    );

    return birthdayPersons;
  }

  async findByNameAndUserId(
    data: IFindBirthdayPersonByNameAndUserId
  ): Promise<BirthdayPerson | null> {
    const birthdayPerson =
      this.fakeRepository.find(
        (birthdayPerson) =>
          birthdayPerson.name === data.birthdayPersonName &&
          birthdayPerson.userId === data.userId &&
          (data.exceptId ? data.exceptId !== birthdayPerson.id : true)
      ) || null;

    return birthdayPerson;
  }

  async listAllActiveByUser(userId: string): Promise<BirthdayPerson[]> {
    const activeBirthdayPersonsReminder = this.fakeRepository.filter(
      (birthdayPerson) =>
        birthdayPerson.reminderIsActive === true &&
        birthdayPerson.userId === userId
    );

    return activeBirthdayPersonsReminder;
  }

  async findById(id: string): Promise<BirthdayPerson | null> {
    const birthdayPerson =
      this.fakeRepository.find((birthdayPerson) => birthdayPerson.id === id) ||
      null;

    return birthdayPerson;
  }

  async delete(id: string): Promise<void> {
    const index = this.fakeRepository.findIndex(
      (birthdayPerson) => birthdayPerson.id === id
    );

    this.fakeRepository.splice(index, 1);
  }
}

export { FakeBirthdayPersonsRepository };
