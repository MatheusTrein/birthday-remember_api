import { inject, injectable } from "tsyringe";

import { IUserResponse } from "@modules/accounts/dtos/IUserResponse";
import { IUsersRepository } from "@modules/accounts/repositories/IUsersRepository";
import { AppError } from "@shared/errors/AppError";
import { UserMapper } from "@modules/accounts/mappers/UserMapper";

@injectable()
class ShowProfileUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository
  ) {}

  async execute(userId: string): Promise<IUserResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new AppError({
        message: "Only authenticated users can show your profile",
      });
    }

    return UserMapper.toDTO(user);
  }
}

export { ShowProfileUseCase };
