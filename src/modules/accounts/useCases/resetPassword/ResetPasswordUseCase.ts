import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "@modules/accounts/repositories/IUsersRepository";
import { IUserTokensRepository } from "@modules/accounts/repositories/IUserTokensRepository";
import { IDateProvider } from "@shared/container/Providers/DateProvider/models/IDateProvider";
import { AppError } from "@shared/errors/AppError";
import { IHashProvider } from "@shared/container/Providers/HashProvider/models/IHashProvider";

interface IRequest {
  token: string;
  password: string;
}

@injectable()
class ResetPasswordUseCase {
  constructor(
    @inject("UserTokensRepository")
    private userTokensRepository: IUserTokensRepository,
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
    @inject("DateProvider")
    private dateProvider: IDateProvider,
    @inject("HashProvider")
    private hashProvider: IHashProvider
  ) {}

  async execute({ token, password }: IRequest): Promise<void> {
    const userToken = await this.userTokensRepository.findByTokenAndType(
      token,
      "forgotPasswordUserToken"
    );

    if (!userToken) {
      throw new AppError({
        message: "Invalid user token",
        type: "forgotPasswordToken.invalid",
      });
    }

    const user = await this.usersRepository.findById(userToken.userId);

    if (!user) {
      await this.userTokensRepository.delete(userToken.id);
      throw new AppError({ message: "User not found" });
    }

    const tokenIsExpired = this.dateProvider.checkIfHasPassed(
      new Date(Date.now()),
      userToken.expiresIn
    );

    if (tokenIsExpired) {
      await this.userTokensRepository.delete(userToken.id);
      throw new AppError({ message: "Token expired!" });
    }

    const hashedPassword = await this.hashProvider.generateHash(password);

    user.password = hashedPassword;

    await this.usersRepository.save(user);

    await this.userTokensRepository.delete(userToken.id);
  }
}

export { ResetPasswordUseCase };
