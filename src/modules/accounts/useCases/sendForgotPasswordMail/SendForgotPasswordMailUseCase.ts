import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "@modules/accounts/repositories/IUsersRepository";
import { IUserTokensRepository } from "@modules/accounts/repositories/IUserTokensRepository";
import { IDateProvider } from "@shared/container/Providers/DateProvider/models/IDateProvider";
import { AppError } from "@shared/errors/AppError";
import { UserToken } from "@modules/accounts/infra/typeorm/entities/UserToken";
import { IQueueProvider } from "@shared/container/Providers/QueueProvider/model/IQueueProvider";

interface IRequest {
  email: string;
}

@injectable()
class SendForgotPasswordMailUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
    @inject("UserTokensRepository")
    private userTokensRepository: IUserTokensRepository,
    @inject("DateProvider")
    private dateProvider: IDateProvider,
    @inject("QueueProvider")
    private queueProvider: IQueueProvider
  ) {}

  async execute({ email }: IRequest): Promise<void> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new AppError({ message: "Email is not registered" });
    }

    const now = this.dateProvider.now();
    const expiresIn = this.dateProvider.addMinutes(now, 2 * 60); // Add 2 hours

    const userAlreadyHaveAnToken =
      await this.userTokensRepository.findByUserIdAndType(
        user.id,
        "forgotPasswordUserToken"
      );

    if (userAlreadyHaveAnToken) {
      await this.userTokensRepository.delete(userAlreadyHaveAnToken.id);
    }

    await this.userTokensRepository.generate({
      userId: user.id,
      type: "forgotPasswordUserToken",
      expiresIn,
    });

    const userToken = (await this.userTokensRepository.findByUserIdAndType(
      user.id,
      "forgotPasswordUserToken"
    )) as UserToken;

    await this.queueProvider.add({
      data: {
        user,
        userToken,
      },
      id: userToken.token,
      key: "SendForgotPasswordMail",
    });
  }
}

export { SendForgotPasswordMailUseCase };
