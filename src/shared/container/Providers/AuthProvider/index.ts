import { container } from "tsyringe";

import { JWTAuthProvider } from "./implementations/JWTAuthProvider";
import authConfig from "@config/auth";

const authProviders: any = {
  jwt: JWTAuthProvider,
};

container.registerSingleton("AuthProvider", authProviders[authConfig.driver]);
