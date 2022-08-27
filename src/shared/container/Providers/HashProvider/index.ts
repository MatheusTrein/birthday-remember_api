import { container } from "tsyringe";

import { BCryptHashProvider } from "./implementations/BCryptHashProvider";
import { IHashProvider } from "./models/IHashProvider";

const driver = process.env.HASH_DRIVER || "bcrypt";

const hashProviders: any = {
  bcrypt: BCryptHashProvider,
};

container.registerSingleton<IHashProvider>(
  "HashProvider",
  hashProviders[driver]
);
