import { Repository } from "typeorm";

import { ICreateUserToken } from "@modules/accounts/dtos/ICreateUserToken";
import { IUserTokensRepository } from "@modules/accounts/repositories/IUserTokensRepository";
import { UserToken } from "../entities/UserToken";
import connectionTypeORM from "@shared/infra/typeorm";

class PostgresUserTokensRepository implements IUserTokensRepository {
  private repository: Repository<UserToken>;

  constructor() {
    this.repository = connectionTypeORM.getRepository(UserToken);
  }

  async generate(data: ICreateUserToken): Promise<UserToken> {
    const userToken = this.repository.create(data);

    await this.repository.save(userToken);

    return userToken;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }

  async findByUserIdAndType(
    userId: string,
    type: string
  ): Promise<UserToken | null> {
    const userToken = await this.repository.findOne({
      where: { userId, type },
    });

    return userToken;
  }

  async findByTokenAndType(
    token: string,
    type: string
  ): Promise<UserToken | null> {
    const userToken = await this.repository.findOne({ where: { token, type } });

    return userToken;
  }
}

export { PostgresUserTokensRepository };
