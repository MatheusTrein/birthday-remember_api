import { ICreateUserToken } from "../dtos/ICreateUserToken";
import { UserToken } from "../infra/typeorm/entities/UserToken";

interface IUserTokensRepository {
  generate(data: ICreateUserToken): Promise<UserToken>;
  delete(id: string): Promise<void>;
  findByUserIdAndType(userId: string, type: string): Promise<UserToken | null>;
  findByTokenAndType(token: string, type: string): Promise<UserToken | null>;
}

export { IUserTokensRepository };
