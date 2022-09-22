import "dotenv/config";
import "reflect-metadata";
import express, { NextFunction, Request, Response } from "express";
import "express-async-errors";
import requestIp from "request-ip";
import helmet from "helmet";
import cors from "cors";

import createTypeORMConnection from "@shared/infra/typeorm";
import "@shared/container";
import { AppError } from "@shared/errors/AppError";
import uploadConfig from "@config/upload";
import { rateLimiter } from "./middlewares/rateLimiter";
import { router } from "./routes";
import useragent from "express-useragent";

import { errors } from "celebrate";
import { container } from "tsyringe";
import { IQueueProvider } from "@shared/container/Providers/QueueProvider/model/IQueueProvider";

if (process.env.NODE_ENV !== "test") {
  createTypeORMConnection.initialize();
  const queueProvider = container.resolve<IQueueProvider>("QueueProvider");
  queueProvider.remove("PostgresBackup", "backupDatabase").then((data) => {
    queueProvider.add({
      data: {},
      id: "backupDatabase",
      key: "PostgresBackup",
    });
    queueProvider.add({
      data: {},
      id: "backupDatabase",
      key: "PostgresBackup",
      cron: {
        date: new Date(),
        repeatEvery: "day",
      },
    });
  });
}

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    exposedHeaders: "x-total-count",
  })
);

app.use(helmet()); // Helmet implementa headers de segurança (estar antes de todos os middlewares)
app.use(express.json()); // Espera requisições do formato json
app.use("/files", express.static(uploadConfig.uploadFolder));
app.use(useragent.express());
app.use(rateLimiter); // rateLimiter limita a quantidade de requisições (não precisa limitar o uso dos arquivos estáticos)
app.use(requestIp.mw()); // request ip, insere na requisição o ip do cliente
app.use(router);

// Celebrate Errors
app.use(errors());

// Exception Handling
app.use(
  async (
    error: Error,
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    console.log(error);
    if (error instanceof AppError) {
      return response.status(error.statusCode).json(error);
    } else {
      const queueProvider = container.resolve<IQueueProvider>("QueueProvider");
      await queueProvider.add({
        data: {
          error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
          statusCode: 500,
          subject: `Error: ${error.message}`,
          to: {
            name: process.env.NOTIFICATION_NAME_TO,
            email: process.env.NOTIFICATION_EMAIL_TO,
          },
        },
        id: error.message,
        key: "ReportErrorToTeamByMail",
      });
      return response
        .status(500)
        .json({ message: `Internal Server Error - ${error.message}` });
    }
  }
);

export { app };
