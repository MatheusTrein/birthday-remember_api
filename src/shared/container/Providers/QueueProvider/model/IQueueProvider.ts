import { ICreateQueue } from "../dtos/ICreateQueue";
import { Queue } from "../implementations/BullQueueProvider";

interface IQueueProvider {
  add(data: ICreateQueue): Promise<void>;
  remove(key: string, id: string): Promise<void>;
  process(): void;
}

export { IQueueProvider };
