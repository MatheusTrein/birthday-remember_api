import { Router } from "express";
import { celebrate, Joi, Segments } from "celebrate";

import { SendForgotPasswordMailController } from "@modules/accounts/useCases/sendForgotPasswordMail/SendForgotPasswordMailController";
import { ResetPasswordController } from "@modules/accounts/useCases/resetPassword/ResetPasswordController";

const sendForgotPasswordMailController = new SendForgotPasswordMailController();
const resetPasswordController = new ResetPasswordController();

const passwordRouter = Router();

passwordRouter.post(
  "/forgot",
  celebrate({
    [Segments.BODY]: Joi.object({
      email: Joi.string().email().trim().required(),
    }),
  }),
  sendForgotPasswordMailController.handle
);
passwordRouter.post(
  "/reset",
  celebrate({
    [Segments.BODY]: Joi.object({
      password: Joi.string().trim().required(),
    }),
  }),
  resetPasswordController.handle
);

export { passwordRouter };
