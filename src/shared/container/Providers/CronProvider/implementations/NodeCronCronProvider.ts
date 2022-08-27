import cron from "node-cron";

import { ICronProvider } from "../models/ICronProvider";

class NodeCronCronProvider implements ICronProvider {
  private nodeCronCronProvider: typeof cron;
  private scheduledJobs: { [key: string]: cron.ScheduledTask };

  constructor() {
    this.nodeCronCronProvider = cron;
    this.scheduledJobs = {};
  }

  createCron(cronId: string, date: Date, callback: any): void {
    const minutes = date.getMinutes();
    const hour = date.getHours();
    const monthDay = date.getDate();
    const month = date.getMonth() + 1;
    const cronExpression = `0 ${minutes} ${hour} ${monthDay} ${month} *`;

    const cron = (this.scheduledJobs[cronId] =
      this.nodeCronCronProvider.schedule(cronExpression, callback, {
        timezone: "UTC",
      }));

    this.scheduledJobs[cronId].start();
  }

  stopCron(cronId: string): void {
    this.scheduledJobs[cronId].stop();
  }
}

export { NodeCronCronProvider };
