import "dotenv/config";
import "reflect-metadata";

import "@shared/container";
import connectionTypeORM from "@shared/infra/typeorm";

import { container, inject, injectable } from "tsyringe";
import { IQueueProvider } from "@shared/container/Providers/QueueProvider/model/IQueueProvider";

@injectable()
class Queue {
  constructor(
    @inject("QueueProvider")
    private queueProvider: IQueueProvider
  ) {}

  execute() {
    this.queueProvider.process();
  }
}

connectionTypeORM.initialize().then((dataSource) => {
  const queue = container.resolve(Queue);

  queue.execute();
});
