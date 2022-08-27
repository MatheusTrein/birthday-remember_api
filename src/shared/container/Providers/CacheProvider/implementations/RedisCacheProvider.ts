import Redis from "ioredis";

import { ICacheProvider } from "../models/ICacheProvider";
import redisConfig from "@config/redis";

class RedisCacheProvider implements ICacheProvider {
  private redisClient: Redis;

  constructor() {
    this.redisClient = new Redis(redisConfig);
  }

  async save(key: string, value: any): Promise<void> {
    const parsedValue = JSON.stringify(value);

    await this.redisClient.set(key, parsedValue);
  }

  async recover<T>(key: string): Promise<T | null> {
    let value: T | null = null;

    const data = await this.redisClient.get(key);

    if (data) {
      value = JSON.parse(data) as T;
    }

    return value;
  }

  async invalidate(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async invalidatePrefix(prefix: string): Promise<void> {
    const keys = await this.redisClient.keys(`${prefix}:*`);

    const pipeline = this.redisClient.pipeline();

    keys.forEach((key) => {
      pipeline.del(key);
    });

    await pipeline.exec();
  }
}

export { RedisCacheProvider };
