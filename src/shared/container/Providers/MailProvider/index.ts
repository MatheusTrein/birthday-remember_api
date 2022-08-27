import { container } from "tsyringe";

import mailConfig from "@config/mail";

import { IMailProvider } from "./models/IMailProvider";
import { NodemailerMailProvider } from "./implementations/NodemailerMailProvider";
import { SESMailProvider } from "./implementations/SESMailProvider";

const mailProviders: any = {
  nodemailer: NodemailerMailProvider,
  ses: SESMailProvider,
};

export const mailProvider = mailProviders[mailConfig.driver];

container.registerSingleton<IMailProvider>("MailProvider", mailProvider);
