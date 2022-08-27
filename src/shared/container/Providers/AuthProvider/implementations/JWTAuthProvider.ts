import jwt, { TokenExpiredError } from "jsonwebtoken";

import { ITokenGenerate } from "../dtos/ITokenGenerate";
import { IVerifyToken } from "../dtos/IVerifyToken";
import { IAuthProvider } from "../models/IAuthProvider";
import { AppError } from "@shared/errors/AppError";

class JWTAuthProvider implements IAuthProvider {
  private jwtClient: typeof jwt;

  constructor() {
    this.jwtClient = jwt;
  }

  generateToken({ authSecret, expiresIn, userId }: ITokenGenerate): string {
    const token = this.jwtClient.sign({}, authSecret, {
      subject: userId,
      expiresIn,
    });

    return token;
  }

  verifyToken({ token, authSecret }: IVerifyToken): string {
    try {
      const { sub: userId } = this.jwtClient.verify(token, authSecret);

      return userId as string;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new AppError({
          message: "Token is expired",
          statusCode: 401,
          type: "token.expired",
        });
      } else {
        throw new AppError({
          message: "Token is invalid",
          statusCode: 401,
          type: "token.invalid",
        });
      }
    }
  }
}

export { JWTAuthProvider };
