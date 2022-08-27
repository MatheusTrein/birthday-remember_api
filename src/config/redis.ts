import { RedisOptions } from "ioredis";

export interface RedisConfig extends RedisOptions {
  portFromTest: number;
}

let port = Number(process.env.REDIS_PORT);

// let host = "redis_birthday-remember";
let host = "localhost";

if (process.env.NODE_ENV === "test") {
  // host = "redis_birthday-remember_tests",  // Somente descomentar essa propriedade qdo quisermos rodar os testes dentro do container
  port = 63791;
  host = "localhost";
}

export default {
  host,
  port,
  password: process.env.REDIS_PASSWORD,
} as RedisConfig;
