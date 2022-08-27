import { Repository } from "typeorm";

import DataSourceTypeORM from "@shared/infra/typeorm";
import { User } from "../entities/User";
import { IUsersRepository } from "@modules/accounts/repositories/IUsersRepository";
import { ICreateUser } from "@modules/accounts/dtos/ICreateUser";

class PostgresUsersRepository implements IUsersRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = DataSourceTypeORM.getRepository(User);
  }
  async create(data: ICreateUser): Promise<User> {
    const user = this.repository.create(data);

    await this.repository.save(user);

    return user;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.repository.findOne({ where: { id } });

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.repository.findOne({ where: { email } });

    return user;
  }

  async save(user: User): Promise<User> {
    await this.repository.save(user);

    return user;
  }
}

export { PostgresUsersRepository };
