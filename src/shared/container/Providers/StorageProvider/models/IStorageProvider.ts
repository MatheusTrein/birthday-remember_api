interface IStorageProvider {
  saveFile(fileName: string): Promise<void>;
  deleteFile(fileName: string): Promise<void>;
  clearTmpFolder(): void;
}

export { IStorageProvider };
