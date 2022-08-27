import { v4 as uuidV4 } from "uuid";

import { ITokenGenerate } from "../dtos/ITokenGenerate";
import { IVerifyToken } from "../dtos/IVerifyToken";
import { IAuthProvider } from "../models/IAuthProvider";
import authConfig from "@config/auth";
import { AppError } from "@shared/errors/AppError";

class FakeAuthProvider implements IAuthProvider {
  private generatedTokens: {
    [token: string]: {
      authSecret: string;
      expiresIn: string;
      userId: string;
    };
  };
  private authSecret: string;

  constructor() {
    this.generatedTokens = {};
    this.authSecret = authConfig.authSecret;
  }

  generateToken(data: ITokenGenerate): string {
    const token = uuidV4();

    this.generatedTokens[token] = {
      authSecret: data.authSecret,
      expiresIn: data.expiresIn,
      userId: data.userId,
    };

    return token;
  }

  verifyToken(data: IVerifyToken): string {
    if (
      data.authSecret !== this.authSecret ||
      data.authSecret !== this.generatedTokens[data.token].authSecret ||
      !!this.generatedTokens[data.token]
    ) {
      throw new AppError({
        message: "Token is invalid",
        statusCode: 401,
        type: "token.invalid",
      });
    }

    return this.generatedTokens[data.token].userId;
  }
}

export { FakeAuthProvider };
