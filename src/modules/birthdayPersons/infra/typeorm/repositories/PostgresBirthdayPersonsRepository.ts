import { Not, Repository } from "typeorm";

import { ICreateBirthdayPerson } from "@modules/birthdayPersons/dtos/ICreateBirthdayPerson";
import { IBirthdayPersonsRepository } from "@modules/birthdayPersons/repositories/IBirthdayPersonsRepository";
import { BirthdayPerson } from "../entities/BirthdayPerson";
import connectionTypeORM from "@shared/infra/typeorm";
import { IFindBirthdayPersonByNameAndUserId } from "@modules/birthdayPersons/dtos/IFindBirthdayPersonByNameAndUserId";

class PostgresBirthdayPersonsRepository implements IBirthdayPersonsRepository {
  private repository: Repository<BirthdayPerson>;

  constructor() {
    this.repository = connectionTypeORM.getRepository(BirthdayPerson);
  }

  async create(data: ICreateBirthdayPerson): Promise<BirthdayPerson> {
    const birthdayPerson = this.repository.create(data);

    await this.repository.save(birthdayPerson);

    return birthdayPerson;
  }

  async listOne(birthdayPersonId: string): Promise<BirthdayPerson | null> {
    const birthdayPerson = await this.repository.findOne({
      where: { id: birthdayPersonId },
    });

    return birthdayPerson;
  }

  async save(data: BirthdayPerson): Promise<BirthdayPerson> {
    return await this.repository.save(data);
  }

  async listAllByUser(userId: string): Promise<BirthdayPerson[]> {
    const birthdayPersons = await this.repository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });

    return birthdayPersons;
  }

  async findByNameAndUserId(
    data: IFindBirthdayPersonByNameAndUserId
  ): Promise<BirthdayPerson | null> {
    const birthdayPerson = await this.repository.findOne({
      where: {
        id: data.exceptId ? Not(data.exceptId) : undefined,
        name: data.birthdayPersonName,
        userId: data.userId,
      },
    });

    return birthdayPerson;
  }

  async listAllActiveByUser(userId: string): Promise<BirthdayPerson[]> {
    const activeBirthdayPersonsReminder = await this.repository.find({
      where: { reminderIsActive: true, userId },
      relations: ["user"],
    });

    return activeBirthdayPersonsReminder;
  }

  async findById(id: string): Promise<BirthdayPerson | null> {
    const birthdayPerson = await this.repository.findOne({ where: { id } });

    return birthdayPerson;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}

export { PostgresBirthdayPersonsRepository };
