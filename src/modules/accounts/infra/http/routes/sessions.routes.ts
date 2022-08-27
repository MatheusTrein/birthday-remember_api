import { Router } from "express";
import { celebrate, Joi, Segments } from "celebrate";

import { CreateSessionController } from "@modules/accounts/useCases/createSession/CreateSessionController";
import { RefreshSessionController } from "@modules/accounts/useCases/refreshSession/RefreshSessionController";

const createSessionController = new CreateSessionController();
const refreshSessionController = new RefreshSessionController();

const sessionsRouter = Router();

sessionsRouter.post(
  "/",
  celebrate({
    [Segments.BODY]: Joi.object({
      email: Joi.string().email().trim().required(),
      password: Joi.string().trim().required(),
    }),
  }),
  createSessionController.handle
);
sessionsRouter.post(
  "/refresh",
  celebrate({
    [Segments.BODY]: Joi.object({
      refreshToken: Joi.string().uuid().trim().required(),
    }),
  }),
  refreshSessionController.handle
);

export { sessionsRouter };
