import { v4 as uuidV4 } from "uuid";

import { IHashProvider } from "../models/IHashProvider";

class FakeHashProvider implements IHashProvider {
  private hashsGenerated: { [hash: string]: string };

  constructor() {
    this.hashsGenerated = {};
  }

  async generateHash(string: string): Promise<string> {
    const hash = uuidV4();

    this.hashsGenerated[hash] = string;

    return hash;
  }

  async compare(string: string, hash: string): Promise<boolean> {
    const matched = this.hashsGenerated[hash] === string;

    return matched;
  }
}

export { FakeHashProvider };
