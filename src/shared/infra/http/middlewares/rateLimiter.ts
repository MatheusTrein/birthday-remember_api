import { Request, Response, NextFunction } from "express";
import { RateLimiterRedis } from "rate-limiter-flexible";
import Redis from "ioredis";

import redisConfig from "@config/redis";
import { AppError } from "@shared/errors/AppError";

const limiter = new RateLimiterRedis({
  storeClient: new Redis(redisConfig),
  keyPrefix: "middleware",
  points: 50, // 10 requests
  duration: 5, // per 1 second by IP
  blockDuration: 1000 * 60 * 60 * 24, // 24 hous
});

const rateLimiter = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    await limiter.consume(request.ip);
    next();
  } catch {
    throw new AppError({
      message: "Too many request, you are blocked for 24 hours",
      statusCode: 429,
    });
  }
};
export { rateLimiter };
