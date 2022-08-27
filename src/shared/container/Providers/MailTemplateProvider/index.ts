import { container } from "tsyringe";

import { HandleBarsMailTemplateProvider } from "./implementations/HandleBarsMailTemplateProvider";
import { IMailTemplateProvider } from "./models/IMailTemplateProvider";

const mailTemplateProviders = {
  handlebars: HandleBarsMailTemplateProvider,
};

export const mailTemplateProvider = mailTemplateProviders["handlebars"];

container.registerSingleton<IMailTemplateProvider>(
  "MailTemplateProvider",
  mailTemplateProvider
);
