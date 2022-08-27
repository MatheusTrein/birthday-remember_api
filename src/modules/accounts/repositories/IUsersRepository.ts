import { ICreateUser } from "../dtos/ICreateUser";
import { User } from "../infra/typeorm/entities/User";

interface IUsersRepository {
  create(data: ICreateUser): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
}

export { IUsersRepository };
