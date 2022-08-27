import { Repository } from "typeorm";

import dataSource from "@shared/infra/typeorm";
import { IRefreshTokensRepository } from "@modules/accounts/repositories/IRefreshTokensRepository";
import { RefreshToken } from "../entities/RefreshToken";
import { ICreateRefreshToken } from "@modules/accounts/dtos/ICreateRefreshToken";
import { IFindRefreshToken } from "@modules/accounts/dtos/IFindResfreshToken";

class PostgresRefreshTokensRepository implements IRefreshTokensRepository {
  private repository: Repository<RefreshToken>;

  constructor() {
    this.repository = dataSource.getRepository(RefreshToken);
  }

  async create(data: ICreateRefreshToken): Promise<RefreshToken> {
    const refreshToken = this.repository.create(data);

    await this.repository.save(refreshToken);

    return refreshToken;
  }

  async find({
    ip,
    userId,
    isMobile,
  }: IFindRefreshToken): Promise<RefreshToken | null> {
    const refreshToken = await this.repository.findOne({
      where: { ip, userId, isMobile },
    });

    return refreshToken;
  }

  async findById(id: string): Promise<RefreshToken | null> {
    const refreshToken = await this.repository.findOne({
      where: { id },
    });

    return refreshToken;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }
}

export { PostgresRefreshTokensRepository };
