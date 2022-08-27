import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "@modules/accounts/repositories/IUsersRepository";
import { BirthdayPerson } from "@modules/birthdayPersons/infra/typeorm/entities/BirthdayPerson";
import { AppError } from "@shared/errors/AppError";
import { IBirthdayPersonsRepository } from "@modules/birthdayPersons/repositories/IBirthdayPersonsRepository";
import { ICacheProvider } from "@shared/container/Providers/CacheProvider/models/ICacheProvider";
import { IQueueProvider } from "@shared/container/Providers/QueueProvider/model/IQueueProvider";
import { IDateProvider } from "@shared/container/Providers/DateProvider/models/IDateProvider";

interface IRequest {
  userId: string;
  birthdayPersonId: string;
}

@injectable()
class EnableReminderBirthdayUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
    @inject("BirthdayPersonsRepository")
    private birthdayPersonsRepository: IBirthdayPersonsRepository,
    @inject("CacheProvider")
    private cacheProvider: ICacheProvider,
    @inject("QueueProvider")
    private queueProvider: IQueueProvider,
    @inject("DateProvider")
    private dateProvider: IDateProvider
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

    let birthdayPerson = await this.birthdayPersonsRepository.findById(
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

    if (birthdayPerson.reminderIsActive) {
      throw new AppError({ message: "Reminder is already active" });
    }

    birthdayPerson.reminderIsActive = true;

    birthdayPerson = await this.birthdayPersonsRepository.save(birthdayPerson);

    const cacheKey = `birthdayPersons:-${userId}`;

    await this.cacheProvider.invalidate(cacheKey);

    const [hour, minutes, seconds] = birthdayPerson.alarmTime.split(":");

    birthdayPerson.birthDate.setHours(
      Number(hour),
      Number(minutes),
      Number(seconds)
    );

    const date = this.dateProvider.addMinutes(
      birthdayPerson.birthDate,
      user.timezoneOffSet
    );

    await this.queueProvider.add({
      data: {
        birthdayPersonId: birthdayPerson.id,
      },
      id: birthdayPerson.id,
      key: "ReminderBirthdayMail",
      cron: {
        date,
        repeatEvery: "year",
      },
    });

    return birthdayPerson;
  }
}

export { EnableReminderBirthdayUseCase };
