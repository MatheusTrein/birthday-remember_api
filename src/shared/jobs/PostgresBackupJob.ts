import util from "util";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { delay, inject, injectable, registry } from "tsyringe";
import mime from "mime-types";

import { IJob } from "./model/IJob";
import { mailProvider } from "@shared/container/Providers/MailProvider";
import { IMailProvider } from "@shared/container/Providers/MailProvider/models/IMailProvider";

@injectable()
@registry([
  {
    token: "MailProvider",
    useToken: delay(() => mailProvider),
  },
])
class PostgresBackupJob implements IJob {
  key: string;

  constructor(
    @inject("MailProvider")
    private mailProvider: IMailProvider
  ) {
    this.key = "PostgresBackup";
  }

  async handle(data: any): Promise<void> {
    const execute = util.promisify(exec);

    const backupFileName = "postgres_birthday-remember_backup.sql";
    const filePath = path.join(__dirname, "..", "..", "..", backupFileName);

    try {
      await execute(
        `docker exec -i postgres_birthday-remember /usr/bin/pg_dump -U ${process.env.POSTGRES_USER} ${process.env.POSTGRES_DB} > ${backupFileName}`
      );

      const fileWasGenerated = fs.existsSync(filePath);

      if (!fileWasGenerated) {
        throw new Error("Postgres backup file was not created");
      }

      const file = fs.readFileSync(filePath, "utf8");
      const fileType = mime.lookup(filePath);

      const now = new Date();

      await this.mailProvider.sendMail({
        from: {
          email: process.env.NOTIFICATION_EMAIL_FROM as string,
          name: "Infra",
        },
        to: {
          email: process.env.NOTIFICATION_EMAIL_TO as string,
          name: process.env.NOTIFICATION_NAME_TO as string,
        },
        subject: `Birthday Remember - Postgres Backup ${now.toDateString()}`,
        templateData: {
          body: "Backup Postgres",
        },
        attachments: [
          {
            content: file,
            contentType: fileType as string,
            filename: backupFileName,
          },
        ],
      });
    } catch (error) {
      console.log(error);
    }
  }
}

export { PostgresBackupJob };
