import { container } from "tsyringe";

import { BullQueueProvider } from "./implementations/BullQueueProvider";

container.registerInstance("QueueProvider", new BullQueueProvider());
