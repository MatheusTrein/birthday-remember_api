import { inject, injectable } from "tsyringe";

import { IUserResponse } from "@modules/accounts/dtos/IUserResponse";
import { UserMapper } from "@modules/accounts/mappers/UserMapper";
import { IUsersRepository } from "@modules/accounts/repositories/IUsersRepository";
import { IUserTokensRepository } from "@modules/accounts/repositories/IUserTokensRepository";
import { AppError } from "@shared/errors/AppError";

@injectable()
class VerifyUserUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
    @inject("UserTokensRepository")
    private userTokensRepository: IUserTokensRepository
  ) {}

  async execute(userToken: string): Promise<IUserResponse> {
    const verifyUserToken = await this.userTokensRepository.findByTokenAndType(
      userToken,
      "verifyUserToken"
    );

    if (!verifyUserToken) {
      throw new AppError({
        message: "Invalid verification token",
        type: "verification.failed",
      });
    }

    const user = await this.usersRepository.findById(verifyUserToken.userId);

    if (!user) {
      throw new AppError({ message: "User not found" });
    }

    if (user.isVerified === true) {
      throw new AppError({
        message: "User is already verified",
        type: "verification.true",
      });
    }

    user.isVerified = true;

    const verifiedUser = await this.usersRepository.save(user);

    return UserMapper.toDTO(verifiedUser);
  }
}

export { VerifyUserUseCase };
