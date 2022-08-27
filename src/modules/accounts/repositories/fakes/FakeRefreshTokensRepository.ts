import { v4 as uuidV4 } from "uuid";

import { ICreateRefreshToken } from "@modules/accounts/dtos/ICreateRefreshToken";
import { IFindRefreshToken } from "@modules/accounts/dtos/IFindResfreshToken";
import { RefreshToken } from "@modules/accounts/infra/typeorm/entities/RefreshToken";
import { IRefreshTokensRepository } from "../IRefreshTokensRepository";

class FakeRefreshTokensRepository implements IRefreshTokensRepository {
  private fakeRepository: RefreshToken[];

  constructor() {
    this.fakeRepository = [];
  }

  async create(data: ICreateRefreshToken): Promise<RefreshToken> {
    let refreshToken = {} as RefreshToken;

    Object.assign(refreshToken, {
      id: uuidV4(),
      createdAt: new Date(),
      ip: data.ip,
      isMobile: data.isMobile,
      userId: data.userId,
      expiresIn: data.expiresIn,
    } as RefreshToken);

    this.fakeRepository.push(refreshToken);

    return refreshToken;
  }

  async find(data: IFindRefreshToken): Promise<RefreshToken | null> {
    return (
      this.fakeRepository.find(
        (refreshToken) =>
          refreshToken.ip === data.ip &&
          refreshToken.userId === data.userId &&
          refreshToken.isMobile === data.isMobile
      ) || null
    );
  }

  async findById(id: string): Promise<RefreshToken | null> {
    return (
      this.fakeRepository.find((refreshToken) => refreshToken.id === id) || null
    );
  }

  async delete(id: string): Promise<void> {
    const refreshTokenIndex = this.fakeRepository.findIndex(
      (refreshToken) => refreshToken.id === id
    );

    this.fakeRepository.splice(refreshTokenIndex, 1);
  }
}

export { FakeRefreshTokensRepository };
