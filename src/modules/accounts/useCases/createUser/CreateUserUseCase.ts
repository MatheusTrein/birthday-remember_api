import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "@modules/accounts/repositories/IUsersRepository";
import { AppError } from "@shared/errors/AppError";
import { IHashProvider } from "@shared/container/Providers/HashProvider/models/IHashProvider";
import { IUserTokensRepository } from "@modules/accounts/repositories/IUserTokensRepository";
import { UserToken } from "@modules/accounts/infra/typeorm/entities/UserToken";
import { IQueueProvider } from "@shared/container/Providers/QueueProvider/model/IQueueProvider";
import { IUserResponse } from "@modules/accounts/dtos/IUserResponse";
import { UserMapper } from "@modules/accounts/mappers/UserMapper";

interface IRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  avatar?: string;
  timezoneOffSet: number;
}

@injectable()
class CreateUserUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
    @inject("HashProvider")
    private hashProvider: IHashProvider,
    @inject("UserTokensRepository")
    private userTokensRepository: IUserTokensRepository,
    @inject("QueueProvider")
    private queueProvider: IQueueProvider
  ) {}

  async execute({ password, ...data }: IRequest): Promise<IUserResponse> {
    const userAlreadyExists = await this.usersRepository.findByEmail(
      data.email
    );

    if (userAlreadyExists) {
      throw new AppError({ message: "This email is already registered" });
    }

    const hashedPassword = await this.hashProvider.generateHash(password);

    const user = await this.usersRepository.create({
      ...data,
      password: hashedPassword,
    });

    await this.userTokensRepository.generate({
      userId: user.id,
      type: "verifyUserToken",
    });

    const verifyUserToken =
      (await this.userTokensRepository.findByUserIdAndType(
        user.id,
        "verifyUserToken"
      )) as UserToken;

    await this.queueProvider.add({
      data: {
        to: {
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
        },
        verifyUserToken,
      },
      id: verifyUserToken.id,
      key: "SendVerificationLinkToUserMail",
    });

    return UserMapper.toDTO(user);
  }
}

export { CreateUserUseCase };
