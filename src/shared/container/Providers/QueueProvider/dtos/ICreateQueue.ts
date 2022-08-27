interface ICreateQueue {
  id: string;
  key: string;
  data: any;
  cron?: {
    date: Date;
    repeatEvery?:
      | "second"
      | "minute"
      | "hour"
      | "day"
      | "month"
      | "year"
      | "not-repeat";
  };
}

export { ICreateQueue };
