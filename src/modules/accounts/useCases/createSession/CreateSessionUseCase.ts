import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "@modules/accounts/repositories/IUsersRepository";
import { AppError } from "@shared/errors/AppError";
import authConfig from "@config/auth";
import { IRefreshTokensRepository } from "@modules/accounts/repositories/IRefreshTokensRepository";
import { IDateProvider } from "@shared/container/Providers/DateProvider/models/IDateProvider";
import { IUserResponse } from "@modules/accounts/dtos/IUserResponse";
import { UserMapper } from "@modules/accounts/mappers/UserMapper";
import { IAuthProvider } from "@shared/container/Providers/AuthProvider/models/IAuthProvider";
import { IHashProvider } from "@shared/container/Providers/HashProvider/models/IHashProvider";

interface IRequest {
  ip: string | null;
  isMobile: boolean;
  email: string;
  password: string;
}

interface IResponse {
  token: string;
  refreshToken: string;
  user: IUserResponse;
}

@injectable()
class CreateSessionUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
    @inject("RefreshTokensRepository")
    private refreshTokensRepository: IRefreshTokensRepository,
    @inject("DateProvider")
    private dateProvider: IDateProvider,
    @inject("HashProvider")
    private hashProvider: IHashProvider,
    @inject("AuthProvider")
    private authProvider: IAuthProvider
  ) {}

  async execute({
    ip,
    email,
    password,
    isMobile,
  }: IRequest): Promise<IResponse> {
    if (!ip) {
      throw new AppError({
        message: "Suspect access denied!",
        statusCode: 401,
      });
    }

    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new AppError({
        message: "Email or password invalid",
        statusCode: 401,
      });
    }

    if (!user.isVerified) {
      throw new AppError({
        message: "User is not verified!",
        statusCode: 401,
        type: "verification.false",
      });
    }

    const passwordMatch = await this.hashProvider.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      throw new AppError({
        message: "Email or password invalid",
        statusCode: 401,
      });
    }

    const { authSecret, tokenExpireInMinutes, refreshTokenExpiresInDays } =
      authConfig;

    const token = this.authProvider.generateToken({
      authSecret,
      expiresIn: `${tokenExpireInMinutes}m`,
      userId: user.id,
    });

    const refreshTokenExists = await this.refreshTokensRepository.find({
      ip,
      userId: user.id,
      isMobile,
    });

    if (refreshTokenExists) {
      await this.refreshTokensRepository.delete(refreshTokenExists.id);
    }

    const refreshTokenExpiresIn = this.dateProvider.addDays(
      this.dateProvider.now(),
      refreshTokenExpiresInDays
    );

    // const refreshTokenExpiresIn = this.dateProvider.addSeconds(
    //   this.dateProvider.now(),
    //   10
    // );

    const refreshToken = await this.refreshTokensRepository.create({
      ip,
      expiresIn: refreshTokenExpiresIn,
      userId: user.id,
      isMobile,
    });

    return {
      token,
      refreshToken: refreshToken.id,
      user: UserMapper.toDTO(user),
    };
  }
}

export { CreateSessionUseCase };
