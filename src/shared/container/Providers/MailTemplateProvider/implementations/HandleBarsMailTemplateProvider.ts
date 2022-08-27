import handlebars from "handlebars";
import fs from "fs";

import { IMailTemplateProvider } from "../models/IMailTemplateProvider";
import { IParseTemplateData } from "../../MailProvider/dtos/IParseTemplateData";

class HandleBarsMailTemplateProvider implements IMailTemplateProvider {
  async parse(templateData: IParseTemplateData): Promise<string> {
    const templateFile = await fs.promises.readFile(
      templateData.html?.filePath as string,
      {
        encoding: "utf8",
      }
    );

    const template = handlebars.compile(templateFile);

    return template(templateData.html?.variables);
  }
}
export { HandleBarsMailTemplateProvider };
