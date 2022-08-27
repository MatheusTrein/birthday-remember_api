interface IHashProvider {
  generateHash(string: string): Promise<string>;
  compare(string: string, hash: string): Promise<boolean>;
}

export { IHashProvider };
