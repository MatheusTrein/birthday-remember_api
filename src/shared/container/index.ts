import { container } from "tsyringe";

import { PostgresRefreshTokensRepository } from "@modules/accounts/infra/typeorm/repositories/PostgresRefreshTokensRepository";
import { PostgresUsersRepository } from "@modules/accounts/infra/typeorm/repositories/PostgresUsersRepository";
import { IRefreshTokensRepository } from "@modules/accounts/repositories/IRefreshTokensRepository";
import { IUsersRepository } from "@modules/accounts/repositories/IUsersRepository";
import { IBirthdayPersonsRepository } from "@modules/birthdayPersons/repositories/IBirthdayPersonsRepository";
import { PostgresBirthdayPersonsRepository } from "@modules/birthdayPersons/infra/typeorm/repositories/PostgresBirthdayPersonsRepository";
import { IUserTokensRepository } from "@modules/accounts/repositories/IUserTokensRepository";
import { PostgresUserTokensRepository } from "@modules/accounts/infra/typeorm/repositories/PostgresUserTokensRepository";

export const dependencies = {
  UsersRepository: PostgresUsersRepository,
  RefreshTokensRepository: PostgresRefreshTokensRepository,
  BirthdayPersonsRepository: PostgresBirthdayPersonsRepository,
  UserTokensRepository: PostgresUserTokensRepository,
};

container.registerSingleton<IUsersRepository>(
  "UsersRepository",
  dependencies.UsersRepository
);

container.registerSingleton<IRefreshTokensRepository>(
  "RefreshTokensRepository",
  dependencies.RefreshTokensRepository
);

container.registerSingleton<IBirthdayPersonsRepository>(
  "BirthdayPersonsRepository",
  dependencies.BirthdayPersonsRepository
);

container.registerSingleton<IUserTokensRepository>(
  "UserTokensRepository",
  dependencies.UserTokensRepository
);

import "./Providers";
