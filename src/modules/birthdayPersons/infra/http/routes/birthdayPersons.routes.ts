import { Router } from "express";
import { celebrate, Joi, Segments } from "celebrate";

import { CreateBirthdayPersonController } from "@modules/birthdayPersons/useCases/createBirthdayPerson/CreateBirthdayPersonController";
import ensureAuthentication from "@modules/accounts/infra/http/middlewares/ensureAuthentication";
import { DisableReminderBirthdayController } from "@modules/birthdayPersons/useCases/disableReminderBirthday/DisableReminderBirthdayController";
import { ListAllBirthdayPersonsController } from "@modules/birthdayPersons/useCases/listAllBirthdayPersons/ListAllBirthdayPersonsController";
import { UpdateBirthdayPersonController } from "@modules/birthdayPersons/useCases/updateBirthdayPerson/UpdateBirthdayPersonController";
import { DeleteBirthdayPersonController } from "@modules/birthdayPersons/useCases/deleteBirthdayPerson/DeleteBirthdayPersonController";
import { EnableReminderBirthdayController } from "@modules/birthdayPersons/useCases/EnableReminderBithday/EnableReminderBirthdayController";

const birthdayPersonsRouter = Router();

const createBirthdayPersonController = new CreateBirthdayPersonController();
const updateBirthdayPersonController = new UpdateBirthdayPersonController();
const disableReminderBirthdayController =
  new DisableReminderBirthdayController();
const enableReminderBirthdayController = new EnableReminderBirthdayController();
const listAllBirthdayPersonsController = new ListAllBirthdayPersonsController();
const deleteBirthdayPersonController = new DeleteBirthdayPersonController();

birthdayPersonsRouter.post(
  "/",
  ensureAuthentication,
  celebrate({
    [Segments.BODY]: Joi.object({
      name: Joi.string().trim().required(),
      birthDate: Joi.date().required(),
      alarmTime: Joi.string()
        .required()
        .regex(/^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d))$/)
        .message('alarmTime must to be in format: "23:59"'),
    }),
  }),
  createBirthdayPersonController.handle
);

birthdayPersonsRouter.put(
  "/:id",
  ensureAuthentication,
  celebrate({
    [Segments.BODY]: Joi.object({
      name: Joi.string().trim().required(),
      birthDate: Joi.date().required(),
      alarmTime: Joi.string()
        .required()
        .regex(
          /^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d))$/,
          'alarmTime must to be in format: "23:59"'
        ),
    }),
    [Segments.PARAMS]: Joi.object({
      id: Joi.string().uuid().required(),
    }),
  }),
  updateBirthdayPersonController.handle
);

birthdayPersonsRouter.delete(
  "/:id",
  ensureAuthentication,
  celebrate({
    [Segments.PARAMS]: Joi.object({
      id: Joi.string().uuid().required(),
    }),
  }),
  deleteBirthdayPersonController.handle
);

birthdayPersonsRouter.patch(
  "/:id/disable",
  ensureAuthentication,
  celebrate({
    [Segments.PARAMS]: Joi.object({
      id: Joi.string().uuid().required(),
    }),
  }),
  disableReminderBirthdayController.handle
);

birthdayPersonsRouter.patch(
  "/:id/enable",
  ensureAuthentication,
  celebrate({
    [Segments.PARAMS]: Joi.object({
      id: Joi.string().uuid().required(),
    }),
  }),
  enableReminderBirthdayController.handle
);

birthdayPersonsRouter.get(
  "/",
  ensureAuthentication,
  celebrate({
    [Segments.QUERY]: Joi.object({
      page: Joi.number().min(1).required(),
      perPage: Joi.number().min(1).required(),
    }),
  }),
  listAllBirthdayPersonsController.handle
);

export { birthdayPersonsRouter };
