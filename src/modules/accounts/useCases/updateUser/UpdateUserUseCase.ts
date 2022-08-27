import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "@modules/accounts/repositories/IUsersRepository";
import { IStorageProvider } from "@shared/container/Providers/StorageProvider/models/IStorageProvider";
import { IUserResponse } from "@modules/accounts/dtos/IUserResponse";
import { AppError } from "@shared/errors/AppError";
import { User } from "@modules/accounts/infra/typeorm/entities/User";
import { UserMapper } from "@modules/accounts/mappers/UserMapper";
import { IHashProvider } from "@shared/container/Providers/HashProvider/models/IHashProvider";
import { IBirthdayPersonsRepository } from "@modules/birthdayPersons/repositories/IBirthdayPersonsRepository";
import { IQueueProvider } from "@shared/container/Providers/QueueProvider/model/IQueueProvider";
import { IDateProvider } from "@shared/container/Providers/DateProvider/models/IDateProvider";

interface IRequest {
  userId: string;
  firstName: string;
  lastName: string;
  timezoneOffSet: number;
  avatar?: string;
  oldPassword?: string;
  newPassword?: string;
}

@injectable()
class UpdateUserUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
    @inject("BirthdayPersonsRepository")
    private birthdayPersonsRepository: IBirthdayPersonsRepository,
    @inject("StorageProvider")
    private storageProvider: IStorageProvider,
    @inject("HashProvider")
    private hashProvider: IHashProvider,
    @inject("QueueProvider")
    private queueProvider: IQueueProvider,
    @inject("DateProvider")
    private dateProvider: IDateProvider
  ) {}

  async execute({ userId, ...data }: IRequest): Promise<IUserResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      this.storageProvider.clearTmpFolder();
      throw new AppError({
        message: "Only authenticated users can be updated",
        statusCode: 401,
      });
    }

    const oldTimezone = user.timezoneOffSet;

    user.firstName = data.firstName;
    user.lastName = data.lastName;
    user.timezoneOffSet = data.timezoneOffSet;

    if (data.newPassword && !data.oldPassword) {
      this.storageProvider.clearTmpFolder();
      throw new AppError({
        message: "To change the password you need inform the old password",
      });
    }

    if (data.newPassword && data.oldPassword) {
      const oldPasswordMatch = await this.hashProvider.compare(
        data.oldPassword,
        user.password
      );

      if (!oldPasswordMatch) {
        this.storageProvider.clearTmpFolder();
        throw new AppError({
          message: "Old password does not match!",
          type: "currentPassword.unmatch",
        });
      }

      const hashedPassword = await this.hashProvider.generateHash(
        data.newPassword
      );

      user.password = hashedPassword;
    }

    if (data.avatar) {
      if (user.avatar) {
        await this.storageProvider.deleteFile(user.avatar);
      }
      user.avatar = data.avatar;

      await this.storageProvider.saveFile(data.avatar);
    }

    await this.usersRepository.save(user);

    const updatedUser = (await this.usersRepository.findById(user.id)) as User;

    const haveToUpdateAllReminderBirthday =
      updatedUser.timezoneOffSet !== oldTimezone;

    if (haveToUpdateAllReminderBirthday) {
      const allActiveBirthdayPersonsFromUser =
        await this.birthdayPersonsRepository.listAllActiveByUser(
          updatedUser.id
        );

      await Promise.all(
        allActiveBirthdayPersonsFromUser.map(async (birthdayPerson) => {
          await this.queueProvider.remove(
            "ReminderBirthdayMail",
            birthdayPerson.id
          );

          const [hour, minutes] = birthdayPerson.alarmTime.split(":");

          birthdayPerson.birthDate.setHours(Number(hour), Number(minutes));

          const date = this.dateProvider.addMinutes(
            birthdayPerson.birthDate,
            updatedUser.timezoneOffSet
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
        })
      );
    }
    return UserMapper.toDTO(updatedUser);
  }
}

export { UpdateUserUseCase };
