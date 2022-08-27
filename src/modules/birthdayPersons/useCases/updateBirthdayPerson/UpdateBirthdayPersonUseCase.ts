import { inject, injectable } from "tsyringe";

import { IBirthdayPersonsRepository } from "@modules/birthdayPersons/repositories/IBirthdayPersonsRepository";
import { BirthdayPerson } from "@modules/birthdayPersons/infra/typeorm/entities/BirthdayPerson";
import { AppError } from "@shared/errors/AppError";
import { IDateProvider } from "@shared/container/Providers/DateProvider/models/IDateProvider";
import { IUsersRepository } from "@modules/accounts/repositories/IUsersRepository";
import { ICacheProvider } from "@shared/container/Providers/CacheProvider/models/ICacheProvider";
import { IQueueProvider } from "@shared/container/Providers/QueueProvider/model/IQueueProvider";

interface IRequest {
  birthdayPersonId: string;
  name: string;
  birthDate: string;
  alarmTime: string;
  userId: string;
}

@injectable()
class UpdateBirthdayPersonUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
    @inject("BirthdayPersonsRepository")
    private birthdayPersonsRepository: IBirthdayPersonsRepository,
    @inject("DateProvider")
    private dateProvider: IDateProvider,
    @inject("CacheProvider")
    private cacheProvider: ICacheProvider,
    @inject("QueueProvider")
    private queueProvider: IQueueProvider
  ) {}

  async execute({
    userId,
    birthdayPersonId,
    ...data
  }: IRequest): Promise<BirthdayPerson> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new AppError({
        message: "Only logged users can update a birthday person",
        statusCode: 401,
      });
    }

    const birthdayPerson = await this.birthdayPersonsRepository.findById(
      birthdayPersonId
    );

    if (!birthdayPerson) {
      throw new AppError({ message: "Birthday person ID not found" });
    }

    if (user.id !== birthdayPerson.userId) {
      throw new AppError({
        message: "You don't have permission for this",
        statusCode: 403,
      });
    }

    const birthdayPersonNameAlreadyExists =
      await this.birthdayPersonsRepository.findByNameAndUserId({
        birthdayPersonName: data.name,
        userId,
        exceptId: birthdayPersonId,
      });

    if (birthdayPersonNameAlreadyExists) {
      throw new AppError({
        message: "You alread registered this birthday person",
      });
    }

    await this.queueProvider.remove("ReminderBirthdayMail", birthdayPerson.id);

    const updatedDirthdayPerson = {
      ...birthdayPerson,
      ...data,
      birthDate: new Date(data.birthDate),
    };

    await this.birthdayPersonsRepository.save(updatedDirthdayPerson);

    const cacheKey = `birthdayPersons:-${userId}`;

    await this.cacheProvider.invalidate(cacheKey);

    const [hour, minutes] = data.alarmTime.split(":");

    birthdayPerson.birthDate.setHours(Number(hour), Number(minutes));

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

    return updatedDirthdayPerson;
  }
}

export { UpdateBirthdayPersonUseCase };
