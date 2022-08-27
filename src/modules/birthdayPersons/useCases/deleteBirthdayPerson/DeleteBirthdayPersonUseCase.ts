import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "@modules/accounts/repositories/IUsersRepository";
import { IBirthdayPersonsRepository } from "@modules/birthdayPersons/repositories/IBirthdayPersonsRepository";
import { AppError } from "@shared/errors/AppError";
import { ICacheProvider } from "@shared/container/Providers/CacheProvider/models/ICacheProvider";
import { IQueueProvider } from "@shared/container/Providers/QueueProvider/model/IQueueProvider";

interface IRequest {
  userId: string;
  birthdayPersonId: string;
}

@injectable()
class DeleteBirthdayPersonUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
    @inject("BirthdayPersonsRepository")
    private birthdayPersonsRepository: IBirthdayPersonsRepository,
    @inject("CacheProvider")
    private cacheProvider: ICacheProvider,
    @inject("QueueProvider")
    private queueProvider: IQueueProvider
  ) {}

  async execute({ userId, birthdayPersonId }: IRequest): Promise<void> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new AppError({
        message: "Only authenticated users can delete their birthday person",
      });
    }

    const birthdayPerson = await this.birthdayPersonsRepository.findById(
      birthdayPersonId
    );

    if (!birthdayPerson) {
      throw new AppError({ message: "Birthday person ID is not registered" });
    }

    await this.queueProvider.remove("ReminderBirthdayMail", birthdayPerson.id);

    const cacheKey = `birthdayPersons:-${user.id}`;

    await this.cacheProvider.invalidate(cacheKey);

    await this.birthdayPersonsRepository.delete(birthdayPerson.id);
  }
}

export { DeleteBirthdayPersonUseCase };
