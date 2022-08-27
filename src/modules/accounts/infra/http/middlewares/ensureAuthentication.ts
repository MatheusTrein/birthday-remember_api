import { NextFunction, Request, Response } from "express";

import { AppError } from "@shared/errors/AppError";
import authConfig from "@config/auth";
import { container } from "tsyringe";
import { IAuthProvider } from "@shared/container/Providers/AuthProvider/models/IAuthProvider";

const authProvider = container.resolve<IAuthProvider>("AuthProvider");

export default async function (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new AppError({
      message: "Token is missing",
      statusCode: 401,
      type: "token.missing",
    });
  }

  const [, token] = authHeader.split(" ");

  const userId = authProvider.verifyToken({
    authSecret: authConfig.authSecret,
    token,
  });

  request.user = { id: userId };

  next();
}

// try {
//   const { sub: userId } = verify(
//     token,
//     authConfig.auth_secret
//   ) as ITokenPayLoad;

//   request.user = { id: userId };

//   return next();
// } catch (error) {
//   if (error instanceof TokenExpiredError) {
//     throw new AppError({
//       message: "Token is expired",
//       statusCode: 401,
//       type: "token.expired",
//     });
//   } else {
//     throw new AppError({
//       message: "Token is invalid",
//       statusCode: 401,
//       type: "token.invalid",
//     });
//   }
// }
