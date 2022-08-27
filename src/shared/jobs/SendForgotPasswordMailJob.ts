import { delay, inject, injectable, registry } from "tsyringe";
import path from "path";

import { IMailProvider } from "@shared/container/Providers/MailProvider/models/IMailProvider";
import { UserToken } from "@modules/accounts/infra/typeorm/entities/UserToken";
import { User } from "@modules/accounts/infra/typeorm/entities/User";
import { IJob } from "./model/IJob";
import { mailProvider } from "@shared/container/Providers/MailProvider";

interface ISendForgotMail {
  data: {
    user: User;
    userToken: UserToken;
  };
}

@injectable()
@registry([
  {
    token: "MailProvider",
    useToken: delay(() => mailProvider),
  },
])
class SendForgotPasswordMailJob implements IJob {
  public key: string;

  constructor(
    @inject("MailProvider")
    private mailProvider: IMailProvider
  ) {
    this.key = "SendForgotPasswordMail";
  }

  async handle({ data: { user, userToken } }: ISendForgotMail): Promise<void> {
    const filePath = path.join(
      __dirname,
      "..",
      "..",
      "modules",
      "accounts",
      "views",
      "forgot_password.hbs"
    );

    const variables = {
      username: `${user.firstName} ${user.lastName}`,
      link: `${process.env.CLIENT_URL}/password/reset/?token=${userToken.token}`,
      expiresIn: new Date(userToken.expiresIn),
    };

    await this.mailProvider.sendMail({
      from: {
        name: "Equipe",
        email: process.env.NOTIFICATION_EMAIL_FROM as string,
      },
      to: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
      },
      subject: "Recuperação de senha",
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

export { SendForgotPasswordMailJob };
