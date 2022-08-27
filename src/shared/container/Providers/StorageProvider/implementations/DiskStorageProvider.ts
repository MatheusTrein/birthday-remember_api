import fs from "fs";
import path from "path";

import uploadConfig from "@config/upload";

import { IStorageProvider } from "../models/IStorageProvider";

class DiskStorageProvider implements IStorageProvider {
  async saveFile(fileName: string): Promise<void> {
    const originalPath = path.join(uploadConfig.tmpFolder, fileName);
    const destinationPath = path.join(uploadConfig.uploadFolder, fileName);

    await fs.promises.rename(originalPath, destinationPath);
  }
  async deleteFile(fileName: string): Promise<void> {
    const filePath = path.join(uploadConfig.uploadFolder, fileName);

    await fs.promises.unlink(filePath);
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
export { DiskStorageProvider };
