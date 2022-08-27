import "reflect-metadata";
import "dotenv/config";

import { DataSource, DataSourceOptions } from "typeorm";

let config: DataSourceOptions = {
  type: "postgres",
  port: Number(process.env.POSTGRES_PORT),
  entities: ["./src/modules/**/infra/typeorm/entities/*.ts"],
  migrations: [
    "./src/shared/infra/typeorm/migrations/*.ts",
    "./src/shared/infra/typeorm/migrations",
  ],
};

if (process.env.NODE_ENV === "production") {
  config = {
    type: "postgres",
    port: Number(process.env.POSTGRES_PORT),
    entities: ["./dist/modules/**/infra/typeorm/entities/*.js"],
    migrations: [
      "./dist/shared/infra/typeorm/migrations/*.js",
      "./dist/shared/infra/typeorm/migrations",
    ],
  };
}

if (process.env.NODE_ENV === "test") {
  Object.assign(config, {
    host: "localhost",
    port: 54321,
    // host: "postgres_birthday-remember_tests", // Somente descomentar essa propriedade qdo quisermos rodar os testes dentro do container
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: "birthday-remember_tests",
  } as DataSourceOptions);
} else if (process.env.NODE_ENV === "development") {
  Object.assign(config, {
    host: "localhost",
    // host: "postgres_birthday-remember",
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: "birthday-remember",
  } as DataSourceOptions);
} else if (process.env.NODE_ENV === "production") {
  Object.assign(config, {
    host: "localhost",
    // host: "postgres_birthday-remember",
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: "birthday-remember",
  } as DataSourceOptions);
}

export default new DataSource(config);
