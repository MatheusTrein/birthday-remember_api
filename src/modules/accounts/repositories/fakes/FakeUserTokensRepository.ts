import { v4 as uuidV4 } from "uuid";

import { ICreateUserToken } from "@modules/accounts/dtos/ICreateUserToken";
import { UserToken } from "@modules/accounts/infra/typeorm/entities/UserToken";
import { IUserTokensRepository } from "../IUserTokensRepository";

class FakeUserTokensRepository implements IUserTokensRepository {
  private fakeRepository: UserToken[];

  constructor() {
    this.fakeRepository = [];
  }

  async generate(data: ICreateUserToken): Promise<UserToken> {
    let userToken = {} as UserToken;

    Object.assign(userToken, {
      id: uuidV4(),
      token: uuidV4(),
      userId: data.userId,
      type: data.type,
      expiresIn: data.expiresIn,
    } as UserToken);

    this.fakeRepository.push(userToken);

    return userToken;
  }

  async delete(id: string): Promise<void> {
    const userTokenIndex = this.fakeRepository.findIndex(
      (userToken) => userToken.id === id
    ) as number;

    this.fakeRepository.splice(userTokenIndex, 1);
  }

  async findByUserIdAndType(
    userId: string,
    type: string
  ): Promise<UserToken | null> {
    const userToken =
      this.fakeRepository.find(
        (userToken) => userToken.userId === userId && userToken.type === type
      ) || null;

    return userToken;
  }

  async findByTokenAndType(
    token: string,
    type: string
  ): Promise<UserToken | null> {
    const userToken =
      this.fakeRepository.find(
        (userToken) => userToken.token === token && userToken.type === type
      ) || null;

    return userToken;
  }
}

export { FakeUserTokensRepository };
