import { ICronProvider } from "../models/ICronProvider";

class FakeCronProvider implements ICronProvider {
  private fakeScheduledJobs: { [key: string]: string };

  constructor() {
    this.fakeScheduledJobs = {};
  }

  createCron(cronId: string, date: Date, callback: any): void {
    this.fakeScheduledJobs[cronId] = "fakeJob";
  }

  stopCron(cronId: string): void {
    delete this.fakeScheduledJobs[cronId];
  }
}

export { FakeCronProvider };
