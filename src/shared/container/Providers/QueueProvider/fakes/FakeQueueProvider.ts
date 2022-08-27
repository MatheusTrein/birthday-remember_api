import { ICreateQueue } from "../dtos/ICreateQueue";
import { Queue } from "../implementations/BullQueueProvider";
import { IQueueProvider } from "../model/IQueueProvider";

class FakeQueueProvider implements IQueueProvider {
  private queues: Queue[];

  constructor() {
    this.queues = [];
  }

  async add(data: ICreateQueue): Promise<void> {}
  async remove(key: string, id: string): Promise<void> {}
  process(): Queue[] {
    return this.queues;
  }
}

export { FakeQueueProvider };
