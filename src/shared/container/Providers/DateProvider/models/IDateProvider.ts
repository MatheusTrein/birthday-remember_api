interface IDateProvider {
  now(date?: Date): Date;
  addDays(date: Date, days: number): Date;
  addSeconds(date: Date, seconds: number): Date;
  addMinutes(date: Date, minutes: number): Date;
  checkIfHasPassed(date: Date, endDate: Date): boolean;
}

export { IDateProvider };
