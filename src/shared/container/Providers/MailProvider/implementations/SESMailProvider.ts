import aws from "aws-sdk";
import { delay, inject, injectable, registry } from "tsyringe";
import nodemailer from "nodemailer";

import { mailTemplateProvider } from "../../MailTemplateProvider";
import { IMailTemplateProvider } from "../../MailTemplateProvider/models/IMailTemplateProvider";
import { ISendMail } from "../dtos/ISendMail";
import { IMailProvider } from "../models/IMailProvider";
import SESTransport from "nodemailer/lib/ses-transport";

@injectable()
@registry([
  {
    token: "MailTemplateProvider",
    useToken: delay(() => mailTemplateProvider),
  },
])
class SESMailProvider implements IMailProvider {
  private transporter: nodemailer.Transporter<SESTransport.SentMessageInfo>;

  constructor(
    @inject("MailTemplateProvider")
    private mailTemplateProvider: IMailTemplateProvider
  ) {
    this.transporter = nodemailer.createTransport({
      SES: new aws.SES({
        apiVersion: "2010-12-01",
        region: process.env.AWS_REGION,
      }),
    });
  }

  async sendMail(data: ISendMail): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: `${data.from.name} | Birthday Remember <${data.from.email}>`,
        to: `${data.to.name} <${data.to.email}>`,
        subject: data.subject,
        html: data.templateData.html
          ? await this.mailTemplateProvider.parse(data.templateData)
          : data.templateData.body,
        attachments: data.attachments,
      });

      console.log(info.messageId);
    } catch (error) {
      console.log(error);
    }
  }
}

export { SESMailProvider };
