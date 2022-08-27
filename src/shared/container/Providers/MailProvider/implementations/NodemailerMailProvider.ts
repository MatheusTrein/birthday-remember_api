import {
  createTransport,
  createTestAccount,
  Transporter,
  getTestMessageUrl,
} from "nodemailer";
import { delay, inject, injectable, registry } from "tsyringe";

import { mailTemplateProvider } from "../../MailTemplateProvider";
import { IMailTemplateProvider } from "../../MailTemplateProvider/models/IMailTemplateProvider";
import { ISendMail } from "../dtos/ISendMail";
import { IMailProvider } from "../models/IMailProvider";

@injectable()
@registry([
  {
    token: "MailTemplateProvider",
    useToken: delay(() => mailTemplateProvider),
  },
])
class NodemailerMailProvider implements IMailProvider {
  private transporter: Transporter;

  constructor(
    @inject("MailTemplateProvider")
    private mailTemplateProvider: IMailTemplateProvider
  ) {}

  async init() {
    const testAccount = await createTestAccount();

    this.transporter = createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendMail({
    subject,
    templateData,
    from,
    to,
  }: ISendMail): Promise<void> {
    console.log("enviando email");
    await this.init();
    const info = await this.transporter.sendMail({
      from: `"${from.name}" <${from.email}>`,
      to: `"${to.name}" <${to.email}>`,
      subject,
      html: templateData.html
        ? await this.mailTemplateProvider.parse(templateData)
        : templateData.body,
    });

    console.log("Message sent: %s", info.messageId);

    console.log("Preview URL: %s", getTestMessageUrl(info));
  }
}

export { NodemailerMailProvider };
