import { ICreateBirthdayPerson } from "../dtos/ICreateBirthdayPerson";
import { IFindBirthdayPersonByNameAndUserId } from "../dtos/IFindBirthdayPersonByNameAndUserId";
import { BirthdayPerson } from "../infra/typeorm/entities/BirthdayPerson";

interface IBirthdayPersonsRepository {
  create(data: ICreateBirthdayPerson): Promise<BirthdayPerson>;
  listOne(birthdayPersonId: string): Promise<BirthdayPerson | null>;
  save(data: BirthdayPerson): Promise<BirthdayPerson>;
  listAllByUser(userId: string): Promise<BirthdayPerson[]>;
  findByNameAndUserId(
    data: IFindBirthdayPersonByNameAndUserId
  ): Promise<BirthdayPerson | null>;
  listAllActiveByUser(userId: string): Promise<BirthdayPerson[]>;
  findById(id: string): Promise<BirthdayPerson | null>;
  delete(id: string): Promise<void>;
}

export { IBirthdayPersonsRepository };
