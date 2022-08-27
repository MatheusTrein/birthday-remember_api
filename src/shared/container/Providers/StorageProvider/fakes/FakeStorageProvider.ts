import { IStorageProvider } from "../models/IStorageProvider";

class FakeStorageProvider implements IStorageProvider {
  async saveFile(fileName: string): Promise<void> {}

  async deleteFile(fileName: string): Promise<void> {}

  clearTmpFolder(): void {}
}

export { FakeStorageProvider };
