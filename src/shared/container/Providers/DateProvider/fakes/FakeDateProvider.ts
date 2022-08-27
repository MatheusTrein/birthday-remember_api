import { IDateProvider } from "../models/IDateProvider";

class FakeDateProvider implements IDateProvider {
  now(date?: Date): Date {
    return date ? new Date(date) : new Date();
  }

  addDays(date: Date, days: number): Date {
    const newDate = date;
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  }

  addMinutes(date: Date, minutes: number): Date {
    const newDate = new Date(date.getTime() + minutes * 60000);
    return newDate;
  }

  checkIfHasPassed(date: Date, endDate: Date): boolean {
    return date > endDate;
  }
}

export { FakeDateProvider };
