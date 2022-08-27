import aws from "aws-sdk";
import path from "path";
import fs from "fs";
import mime from "mime-types";

import uploadConfig from "@config/upload";
import { IStorageProvider } from "../models/IStorageProvider";

class S3StorageProvider implements IStorageProvider {
  private s3Client: aws.S3;

  constructor() {
    this.s3Client = new aws.S3({
      apiVersion: "2006-03-01",
      region: uploadConfig.config.aws.region,
    });
  }

  async saveFile(fileName: string): Promise<void> {
    const pathFile = path.resolve(uploadConfig.tmpFolder, fileName);

    const file = fs.readFileSync(pathFile);

    const type = mime.lookup(pathFile);

    if (!type) {
      throw new Error("File not found");
    }

    await this.s3Client
      .putObject({
        Bucket: uploadConfig.config.aws.bucket,
        Key: fileName,
        Body: file,
        ContentType: type as string,
      })
      .promise();

    await fs.promises.unlink(pathFile);
  }
  async deleteFile(fileName: string): Promise<void> {
    await this.s3Client
      .deleteObject({
        Bucket: uploadConfig.config.aws.bucket,
        Key: fileName,
      })
      .promise();
  }
  clearTmpFolder(): void {
    const directory = uploadConfig.tmpFolder;

    const files = fs.readdirSync(directory);

    files.forEach((file) => {
      if (fs.lstatSync(path.resolve(directory, file)).isFile()) {
        fs.unlinkSync(path.join(directory, file));
      }
    });
  }
}

export { S3StorageProvider };
