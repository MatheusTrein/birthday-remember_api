import { IParseTemplateData } from "../../MailProvider/dtos/IParseTemplateData";

interface IMailTemplateProvider {
  parse(data: IParseTemplateData): Promise<string>;
}

export { IMailTemplateProvider };
