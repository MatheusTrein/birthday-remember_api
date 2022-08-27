import { IParseTemplateData } from "./IParseTemplateData";

interface Attachment {
  content: string;
  filename: string;
  contentType: string;
}

interface ISendMail {
  from: {
    name: string;
    email: string;
  };
  to: {
    name: string;
    email: string;
  };
  subject: string;
  templateData: IParseTemplateData;
  attachments: Attachment[];
}

export { ISendMail };
