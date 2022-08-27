import { delay, inject, injectable, registry } from "tsyringe";
import path from "path";

import { IUsersRepository } from "@modules/accounts/repositories/IUsersRepository";
import { IMailProvider } from "@shared/container/Providers/MailProvider/models/IMailProvider";
import { IBirthdayPersonsRepository } from "@modules/birthdayPersons/repositories/IBirthdayPersonsRepository";
import { IJob } from "./model/IJob";
import { dependencies } from "@shared/container";
import { mailProvider } from "@shared/container/Providers/MailProvider";

interface IReminderBirthday {
  data: {
    birthdayPersonId: string;
  };
}

@injectable()
@registry([
  {
    token: "BirthdayPersonsRepository",
    useToken: delay(() => dependencies.BirthdayPersonsRepository),
  },
  {
    token: "UsersRepository",
    useToken: delay(() => dependencies.UsersRepository),
  },
  {
    token: "MailProvider",
    useToken: delay(() => mailProvider),
  },
])
class ReminderBirthdayMailJob implements IJob {
  public key: string;

  constructor(
    @inject("BirthdayPersonsRepository")
    private birthdayPersonsRepository: IBirthdayPersonsRepository,
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
    @inject("MailProvider")
    private mailProvider: IMailProvider
  ) {
    this.key = "ReminderBirthdayMail";
  }

  async handle({
    data: { birthdayPersonId },
  }: IReminderBirthday): Promise<void> {
    const filePath = path.join(
      __dirname,
      "..",
      "..",
      "modules",
      "accounts",
      "views",
      "reminder_birthday.hbs"
    );

    const birthdayPerson = await this.birthdayPersonsRepository.findById(
      birthdayPersonId
    );

    if (!birthdayPerson) return;

    const user = await this.usersRepository.findById(birthdayPerson.userId);

    if (!user) return;

    const today = new Date();
    const birthdayPersonBirthDate = new Date(birthdayPerson.birthDate);

    const birthdayPersonAge =
      today.getFullYear() - birthdayPersonBirthDate.getFullYear();

    const variables = {
      username: `${user.firstName} ${user.lastName}`,
      birthdayPerson: {
        name: birthdayPerson.name,
        age: birthdayPersonAge,
      },
    };

    await this.mailProvider.sendMail({
      subject: `${birthdayPerson.name} está de aniversário!`,
      from: {
        name: "Hedwig",
        email: process.env.NOTIFICATION_EMAIL_FROM as string,
      },
      to: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
      },
      templateData: {
        html: {
          filePath,
          variables,
        },
        body: "",
      },
      attachments: [],
    });
  }
}

export { ReminderBirthdayMailJob };
