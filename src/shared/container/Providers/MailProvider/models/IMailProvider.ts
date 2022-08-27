import { ISendMail } from "../dtos/ISendMail";

interface IMailProvider {
  sendMail(data: ISendMail): Promise<void>;
}

export { IMailProvider };
