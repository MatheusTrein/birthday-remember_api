import redisConfig, { RedisConfig } from "./redis";

interface CacheConfig {
  driver: "redis";
  redis: RedisConfig;
}

export default {
  driver: process.env.CACHE_DRIVER,
  redis: redisConfig,
} as CacheConfig;
