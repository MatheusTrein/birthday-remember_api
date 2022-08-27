interface Options {
  date: Date;
  repeatEvery?:
    | "second"
    | "minute"
    | "hour"
    | "day"
    | "month"
    | "year"
    | "not-repeat";
}

const dateToCronExpression = ({
  date,
  repeatEvery = "not-repeat",
}: Options): string => {
  const seconds = date.getSeconds();
  const minutes = date.getMinutes();
  const hour = date.getHours();
  const monthDay = date.getDate();
  const month = date.getMonth() + 1;

  let cronExpression: string;

  switch (repeatEvery) {
    case "second":
      cronExpression = `* * * * * *`;
      break;
    case "minute":
      cronExpression = `${seconds} * * * * *`;
      break;
    case "hour":
      cronExpression = `${seconds} ${minutes} * * * *`;
      break;
    case "day":
      cronExpression = `${seconds} ${minutes} ${hour} * * *`;
      break;
    case "month":
      cronExpression = `${seconds} ${minutes} ${hour} ${monthDay} * *`;
      break;
    case "year":
      cronExpression = `${seconds} ${minutes} ${hour} ${monthDay} ${month} *`;
      break;
    case "not-repeat":
      cronExpression = `${seconds} ${minutes} ${hour} ${monthDay} ${month} *`;
      break;
    default:
      cronExpression = `${seconds} ${minutes} ${hour} ${monthDay} ${month} *`;
  }

  return cronExpression;
};

export { dateToCronExpression };
