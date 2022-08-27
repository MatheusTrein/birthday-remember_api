import { ICreateRefreshToken } from "../dtos/ICreateRefreshToken";
import { IFindRefreshToken } from "../dtos/IFindResfreshToken";
import { RefreshToken } from "../infra/typeorm/entities/RefreshToken";

interface IRefreshTokensRepository {
  create(data: ICreateRefreshToken): Promise<RefreshToken>;
  find(data: IFindRefreshToken): Promise<RefreshToken | null>;
  findById(id: string): Promise<RefreshToken | null>;
  delete(id: string): Promise<void>;
}

export { IRefreshTokensRepository };
