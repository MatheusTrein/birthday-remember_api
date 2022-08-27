import { inject, injectable } from "tsyringe";

import { IBirthdayPersonsRepository } from "@modules/birthdayPersons/repositories/IBirthdayPersonsRepository";
import { AppError } from "@shared/errors/AppError";
import { BirthdayPerson } from "@modules/birthdayPersons/infra/typeorm/entities/BirthdayPerson";
import { ICacheProvider } from "@shared/container/Providers/CacheProvider/models/ICacheProvider";
import { IQueueProvider } from "@shared/container/Providers/QueueProvider/model/IQueueProvider";
import { IUsersRepository } from "@modules/accounts/repositories/IUsersRepository";

interface IRequest {
  userId: string;
  birthdayPersonId: string;
}

@injectable()
class DisableReminderBirthdayUseCase {
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

  async execute({
    userId,
    birthdayPersonId,
  }: IRequest): Promise<BirthdayPerson> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new AppError({
        message: "Only authenticated users can change status of reminder",
      });
    }

    const birthdayPerson = await this.birthdayPersonsRepository.listOne(
      birthdayPersonId
    );

    if (!birthdayPerson) {
      throw new AppError({ message: "Birtday Person ID is not registered" });
    }

    if (user.id !== birthdayPerson.userId) {
      throw new AppError({
        message: "You don't have permission for this",
        statusCode: 403,
      });
    }

    if (birthdayPerson.reminderIsActive === false) {
      throw new AppError({ message: "Reminder is not active" });
    }

    birthdayPerson.reminderIsActive = false;

    await this.birthdayPersonsRepository.save(birthdayPerson);

    const cacheKey = `birthdayPersons:-${userId}`;

    await this.cacheProvider.invalidate(cacheKey);

    await this.queueProvider.remove("ReminderBirthdayMail", birthdayPerson.id);

    return birthdayPerson;
  }
}

export { DisableReminderBirthdayUseCase };
