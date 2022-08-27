import { delay, inject, injectable, registry } from "tsyringe";
import path from "path";

import { mailProvider } from "@shared/container/Providers/MailProvider";
import { IMailProvider } from "@shared/container/Providers/MailProvider/models/IMailProvider";
import { IJob } from "./model/IJob";
import { UserToken } from "@modules/accounts/infra/typeorm/entities/UserToken";

interface SendVerificationLinkInfo {
  data: {
    to: {
      email: string;
      name: string;
    };
    verifyUserToken: UserToken;
  };
}

@injectable()
@registry([
  {
    token: "MailProvider",
    useToken: delay(() => mailProvider),
  },
])
class SendVerificationLinkToUserMailJob implements IJob {
  key: string;

  constructor(
    @inject("MailProvider")
    private mailProvider: IMailProvider
  ) {
    this.key = "SendVerificationLinkToUserMail";
  }
  async handle({
    data: { to, verifyUserToken },
  }: SendVerificationLinkInfo): Promise<void> {
    const filePath = path.join(
      __dirname,
      "..",
      "..",
      "modules",
      "accounts",
      "views",
      "verify_user.hbs"
    );

    const verificationLink = `${process.env.CLIENT_URL}/users/verify/?token=${verifyUserToken.token}`;

    const variables = {
      username: to.name,
      link: verificationLink,
    };

    await this.mailProvider.sendMail({
      to: {
        email: to.email,
        name: to.name,
      },
      from: {
        email: process.env.NOTIFICATION_EMAIL_FROM as string,
        name: "Equipe",
      },
      subject: "Verifique sua conta!",
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

export { SendVerificationLinkToUserMailJob };
