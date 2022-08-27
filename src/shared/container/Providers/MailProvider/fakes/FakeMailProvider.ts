import { ISendMail } from "../dtos/ISendMail";
import { IMailProvider } from "../models/IMailProvider";

class FakeMailProvider implements IMailProvider {
  async sendMail(data: ISendMail): Promise<void> {}
}

export { FakeMailProvider };
