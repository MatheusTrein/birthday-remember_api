interface IParseTemplateData {
  html?: {
    filePath: string;
    variables: object;
  };
  body: string;
}

export { IParseTemplateData };
