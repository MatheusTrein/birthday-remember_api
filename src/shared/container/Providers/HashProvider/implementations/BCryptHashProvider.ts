import bcrypt from "bcryptjs";

import { IHashProvider } from "../models/IHashProvider";

class BCryptHashProvider implements IHashProvider {
  private bcryptClient: typeof bcrypt;

  constructor() {
    this.bcryptClient = bcrypt;
  }

  async generateHash(string: string): Promise<string> {
    const hash = await this.bcryptClient.hash(string, 8);

    return hash;
  }

  async compare(string: string, hash: string): Promise<boolean> {
    const matched = await this.bcryptClient.compare(string, hash);

    return matched;
  }
}

export { BCryptHashProvider };
