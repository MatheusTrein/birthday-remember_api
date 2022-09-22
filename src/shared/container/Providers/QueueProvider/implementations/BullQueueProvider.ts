import Bull, { Queue as BullQueue } from "bull";

import { container, injectable } from "tsyringe";

import { ICreateQueue } from "../dtos/ICreateQueue";
import { IQueueProvider } from "../model/IQueueProvider";
import Jobs from "@shared/jobs";
import { IJob } from "@shared/jobs/model/IJob";
import { dateToCronExpression } from "@utils/dateToCronExpression";
import redisConfig from "@config/redis";

export interface Queue {
  bullQueue: BullQueue;
  name: string;
  jobInstance: IJob;
  job: any;
}

@injectable()
class BullQueueProvider implements IQueueProvider {
  private queues: Queue[];

  constructor() {
    this.queues = [];
    this.init();
  }

  private init() {
    Object.values(Jobs).forEach((job) => {
      const jobInstance = container.resolve<IJob>(job);
      this.queues.push({
        bullQueue: new Bull(jobInstance.key, {
          redis: redisConfig,
        }),
        job: job,
        jobInstance: jobInstance,
        name: jobInstance.key,
      });
    });
  }

  async add({ id, key, data, cron }: ICreateQueue): Promise<void> {
    const queue = this.queues.find((queue) => queue.name === key);

    if (!queue) {
      throw new Error(`Queue ${key} not found`);
    }

    // Se paramtro "cron" vier preenchido, chama a funcão geradora do cronExpression, se não for para repetir, seta o limite de repetição para 1 (0 não é executado)
    await queue?.bullQueue.add(data, {
      jobId: id,
      repeat: cron
        ? {
            cron: dateToCronExpression(cron),
            tz: "UTC",
            limit: cron.repeatEvery !== "not-repeat" ? undefined : 1,
          }
        : undefined,
    });
  }

  async remove(key: string, id: string): Promise<void> {
    const queue = this.queues.find((queue) => queue.name === key);

    if (!queue) {
      throw new Error(`Queue ${key} not found`);
    }

    let bullJob = await queue.bullQueue.getJob(id);

    const jobIsAlreadyFinished = !!bullJob?.finishedOn;

    if (!bullJob || jobIsAlreadyFinished) {
      const bullRepeatableJobs = await queue.bullQueue.getRepeatableJobs();
      const bullRepeatableJobsFiltered = bullRepeatableJobs.filter(
        (job) => job.id === id
      );
      if (!bullRepeatableJobs) return;

      await Promise.all(
        bullRepeatableJobsFiltered.map(async (job) => {
          await queue.bullQueue.removeRepeatableByKey(job.key);
        })
      );

      return;
    }

    await queue.bullQueue.removeJobs(id);
  }

  process(): void {
    this.queues.forEach((queue) => {
      queue.bullQueue.process((data) => {
        const jobInstance = container.resolve<IJob>(queue.job);
        jobInstance.handle(data);
      });
      console.log(`Queue ${queue.name} is processing`);
    });
  }
}

export { BullQueueProvider };
