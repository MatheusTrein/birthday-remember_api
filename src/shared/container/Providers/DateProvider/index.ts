import { container } from "tsyringe";

import { IDateProvider } from "./models/IDateProvider";
import { DayJSDateProvider } from "./implementations/DayJSDateProvider";

container.registerSingleton<IDateProvider>("DateProvider", DayJSDateProvider);
