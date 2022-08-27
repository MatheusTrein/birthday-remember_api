import { container } from "tsyringe";
import { NodeCronCronProvider } from "./implementations/NodeCronCronProvider";

import { ICronProvider } from "./models/ICronProvider";

container.registerSingleton<ICronProvider>(
  "CronProvider",
  NodeCronCronProvider
);
