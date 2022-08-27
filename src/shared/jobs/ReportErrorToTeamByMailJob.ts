import { delay, inject, injectable, registry } from "tsyringe";

import { mailProvider } from "@shared/container/Providers/MailProvider";
import { IJob } from "./model/IJob";
import { IMailProvider } from "@shared/container/Providers/MailProvider/models/IMailProvider";

interface ReportErrorInfo {
  data: {
    to: {
      name: string;
      email: string;
    };
    subject: string;
    error: string;
    statusCode: number;
  };
}

@injectable()
@registry([
  {
    token: "MailProvider",
    useToken: delay(() => mailProvider),
  },
])
class ReportErrorToTeamByMailJob implements IJob {
  key: string;

  constructor(
    @inject("MailProvider")
    private mailProvider: IMailProvider
  ) {
    this.key = "ReportErrorToTeamByMail";
  }

  async handle({
    data: { error, statusCode, to, subject },
  }: ReportErrorInfo): Promise<void> {
    await this.mailProvider.sendMail({
      to: {
        email: to.email,
        name: to.name,
      },
      from: {
        email: process.env.NOTIFICATION_EMAIL_FROM as string,
        name: "Error Report",
      },
      subject,
      templateData: {
        body: `
        error: ${error}
        statusCode: ${statusCode}
      `,
      },
      attachments: [],
    });
  }
}

export { ReportErrorToTeamByMailJob };
