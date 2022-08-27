import { container } from "tsyringe";

import cacheConfig from "@config/cache";

import { RedisCacheProvider } from "./implementations/RedisCacheProvider";
import { ICacheProvider } from "./models/ICacheProvider";

const cacheProviders = {
  redis: RedisCacheProvider,
};

container.registerSingleton<ICacheProvider>(
  "CacheProvider",
  cacheProviders[cacheConfig.driver]
);
