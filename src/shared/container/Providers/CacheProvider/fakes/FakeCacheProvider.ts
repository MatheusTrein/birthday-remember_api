import { ICacheProvider } from "../models/ICacheProvider";

class FakeCacheProvider implements ICacheProvider {
  private fakeCache: { [key: string]: string };

  constructor() {
    this.fakeCache = {};
  }

  async save(key: string, value: any): Promise<void> {
    const parsedValue = JSON.stringify(value);

    this.fakeCache[key] = parsedValue;
  }

  async recover<T>(key: string): Promise<T | null> {
    let value: T | null = null;

    const data = this.fakeCache[key];

    if (data) {
      value = JSON.parse(data) as T;
    }

    return value;
  }

  async invalidate(key: string): Promise<void> {
    delete this.fakeCache[key];
  }

  async invalidatePrefix(prefix: string): Promise<void> {
    const keys = Object.keys(this.fakeCache).filter((key) =>
      key.startsWith(`${prefix}:`)
    );

    keys.forEach((key) => {
      delete this.fakeCache[key];
    });
  }
}

export { FakeCacheProvider };
