interface ICronProvider {
  createCron(cronId: string, date: Date, callback: any): void;
  stopCron(cronId: string): void;
}

export { ICronProvider };
