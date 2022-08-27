import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "@modules/accounts/repositories/IUsersRepository";
import { BirthdayPerson } from "@modules/birthdayPersons/infra/typeorm/entities/BirthdayPerson";
import { IBirthdayPersonsRepository } from "@modules/birthdayPersons/repositories/IBirthdayPersonsRepository";
import { AppError } from "@shared/errors/AppError";
import { IDateProvider } from "@shared/container/Providers/DateProvider/models/IDateProvider";
import { ICacheProvider } from "@shared/container/Providers/CacheProvider/models/ICacheProvider";
import { IQueueProvider } from "@shared/container/Providers/QueueProvider/model/IQueueProvider";

interface IRequest {
  name: string;
  birthDate: string;
  alarmTime: string;
  userId: string;
}

@injectable()
class CreateBirthdayPersonUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
    @inject("BirthdayPersonsRepository")
    private birthdayPersosnsRepository: IBirthdayPersonsRepository,
    @inject("DateProvider")
    private dateProvider: IDateProvider,
    @inject("CacheProvider")
    private cacheProvider: ICacheProvider,
    @inject("QueueProvider")
    private queueProvider: IQueueProvider
  ) {}

  async execute({ userId, ...data }: IRequest): Promise<BirthdayPerson> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new AppError({
        message: "Only logged in users can create a birthday person",
      });
    }

    const birthdayPersonAlreadyExists =
      await this.birthdayPersosnsRepository.findByNameAndUserId({
        birthdayPersonName: data.name,
        userId,
      });

    if (birthdayPersonAlreadyExists) {
      throw new AppError({
        message: "You alread registered this birthday person",
      });
    }

    const birthDate = new Date(data.birthDate);

    birthDate.setHours(0, 0, 0);

    const { id } = await this.birthdayPersosnsRepository.create({
      name: data.name,
      birthDate,
      alarmTime: data.alarmTime,
      userId,
    });

    const birthdayPerson = (await this.birthdayPersosnsRepository.findById(
      id
    )) as BirthdayPerson;

    const cacheKey = `birthdayPersons:-${user.id}`;

    await this.cacheProvider.invalidate(cacheKey);

    const [hour, minutes] = birthdayPerson.alarmTime.split(":");

    birthdayPerson.birthDate.setHours(Number(hour), Number(minutes));

    // const dateUTC = new Date(birthdayPerson.birthDate.getUTCDate());

    // dateUTC.setMonth(6);
    // dateUTC.setDate(27);
    // dateUTC.setHours(18, 6);

    const date = this.dateProvider.addMinutes(
      birthdayPerson.birthDate,
      // dateUTC,
      user.timezoneOffSet
    );

    await this.queueProvider.add({
      id: birthdayPerson.id,
      key: "ReminderBirthdayMail",
      data: {
        birthdayPersonId: birthdayPerson.id,
      },
      cron: {
        date,
        repeatEvery: "year",
      },
    });

    return birthdayPerson;
  }
}

export { CreateBirthdayPersonUseCase };
