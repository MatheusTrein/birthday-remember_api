import { IDateProvider } from "../models/IDateProvider";
import dayjs from "dayjs";

class DayJSDateProvider implements IDateProvider {
  private dayJS;

  constructor() {
    this.dayJS = dayjs;
  }

  now(date?: Date): Date {
    return date ? this.dayJS(date).toDate() : this.dayJS().toDate();
  }

  addDays(date: Date, days: number): Date {
    return this.dayJS(date).add(days, "days").toDate();
  }

  addMinutes(date: Date, minutes: number): Date {
    return this.dayJS(date).add(minutes, "minutes").toDate();
  }

  checkIfHasPassed(date: Date, endDate: Date): boolean {
    return this.dayJS(date).isAfter(endDate);
  }
}

export { DayJSDateProvider };
