import { v4 as uuidV4 } from "uuid";

import { ICreateUser } from "@modules/accounts/dtos/ICreateUser";
import { User } from "@modules/accounts/infra/typeorm/entities/User";
import { IUsersRepository } from "../IUsersRepository";

class FakeUsersRepository implements IUsersRepository {
  private fakeRepository: User[];

  constructor() {
    this.fakeRepository = [];
  }

  async create(data: ICreateUser): Promise<User> {
    let user = {} as User;

    Object.assign(user, { id: uuidV4(), ...data });

    this.fakeRepository.push(user);

    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.fakeRepository.find((user) => user.id === id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.fakeRepository.find((user) => user.email === email) || null;
  }

  async save(userData: User): Promise<User> {
    const index = this.fakeRepository.findIndex(
      (user) => user.id === userData.id
    );

    this.fakeRepository[index] = userData;

    return userData;
  }
}

export { FakeUsersRepository };
