import { inject, injectable } from "tsyringe";

import { IRefreshTokensRepository } from "@modules/accounts/repositories/IRefreshTokensRepository";
import { IUsersRepository } from "@modules/accounts/repositories/IUsersRepository";
import { AppError } from "@shared/errors/AppError";
import authConfig from "@config/auth";
import { User } from "@modules/accounts/infra/typeorm/entities/User";
import { IDateProvider } from "@shared/container/Providers/DateProvider/models/IDateProvider";
import { IUserResponse } from "@modules/accounts/dtos/IUserResponse";
import { UserMapper } from "@modules/accounts/mappers/UserMapper";
import { IAuthProvider } from "@shared/container/Providers/AuthProvider/models/IAuthProvider";

interface IResponse {
  token: string;
  refreshToken: string;
  user: IUserResponse;
}

@injectable()
class RefreshSessionUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
    @inject("RefreshTokensRepository")
    private refreshTokensRepository: IRefreshTokensRepository,
    @inject("DateProvider")
    private dateProvider: IDateProvider,
    @inject("AuthProvider")
    private authProvider: IAuthProvider
  ) {}

  async execute(refreshTokenId: string): Promise<IResponse> {
    const refreshToken = await this.refreshTokensRepository.findById(
      refreshTokenId
    );

    if (!refreshToken) {
      throw new AppError({
        message: "Invalid refresh token!",
        statusCode: 401,
        type: "refreshToken.invalid",
      });
    }

    const refreshTokenIsExpired = this.dateProvider.checkIfHasPassed(
      this.dateProvider.now(),
      refreshToken.expiresIn
    );

    if (refreshTokenIsExpired) {
      await this.refreshTokensRepository.delete(refreshToken.id);

      throw new AppError({
        message: "Refresh token is expired!",
        statusCode: 401,
        type: "refreshToken.expired",
      });
    }

    const user = (await this.usersRepository.findById(
      refreshToken.userId
    )) as User;

    const { authSecret, refreshTokenExpiresInDays, tokenExpireInMinutes } =
      authConfig;

    const token = this.authProvider.generateToken({
      authSecret,
      expiresIn: `${tokenExpireInMinutes}m`,
      userId: user.id,
    });

    const newRefreshTokenExpiresIn = this.dateProvider.addDays(
      new Date(),
      refreshTokenExpiresInDays
    );

    await this.refreshTokensRepository.delete(refreshToken.id);

    const newRefreshToken = await this.refreshTokensRepository.create({
      ip: refreshToken.ip,
      isMobile: refreshToken.isMobile,
      userId: user.id,
      expiresIn: newRefreshTokenExpiresIn,
    });

    return {
      token,
      refreshToken: newRefreshToken.id,
      user: UserMapper.toDTO(user),
    };
  }
}

export { RefreshSessionUseCase };
