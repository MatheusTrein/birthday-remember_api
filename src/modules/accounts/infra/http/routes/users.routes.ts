import { Router } from "express";
import multer from "multer";
import { celebrate, Joi, Segments } from "celebrate";

import { CreateUserController } from "@modules/accounts/useCases/createUser/CreateUserController";
import { UpdateAvatarController } from "@modules/accounts/useCases/updateAvatar/UpdateAvatarController";
import ensureAuthentication from "@modules/accounts/infra/http/middlewares/ensureAuthentication";
import uploadConfig from "@config/upload";
import { UpdateUserController } from "@modules/accounts/useCases/updateUser/UpdateUserController";
import { ShowProfileController } from "@modules/accounts/useCases/showProfile/ShowProfileController";
import { VerifyUserController } from "@modules/accounts/useCases/verifyUser/VerifyUserController";

const multerMiddleware = multer({
  limits: { fileSize: 5 * 1000 * 1000 }, // max 2MB file size
  fileFilter: (req, file, callback) => {
    let fileExtension = file.originalname
      .split(".")
      [file.originalname.split(".").length - 1].toLowerCase();
    if (["png", "jpg", "jpeg"].indexOf(fileExtension) === -1) {
      return callback({
        message: "File must to be a PNG or JPEG file",
        name: "Extension error",
      });
    }

    callback(null, true);
  },
  ...uploadConfig.multer,
});

const createUserController = new CreateUserController();
const updateUserController = new UpdateUserController();
const updateAvatarController = new UpdateAvatarController();
const showProfileController = new ShowProfileController();
const verifyUserController = new VerifyUserController();

const usersRouter = Router();

//multer é um middleware pra tratar o conteudo de tipo multipart/form-data
// https://stackoverflow.com/questions/52191614/get-form-data-in-nodejs

usersRouter.post(
  "/",
  celebrate({
    [Segments.BODY]: Joi.object({
      email: Joi.string().email().trim().required(),
      password: Joi.string().trim().required(),
      firstName: Joi.string().trim().required(),
      lastName: Joi.string().trim().required(),
      timezoneOffSet: Joi.number().min(-720).max(840).required(),
    }),
  }),
  createUserController.handle
);
usersRouter.get("/show", ensureAuthentication, showProfileController.handle);
usersRouter.patch("/verify", verifyUserController.handle);
usersRouter.put(
  "/",
  ensureAuthentication,
  multerMiddleware.single("avatar"),
  celebrate({
    [Segments.BODY]: Joi.object({
      oldPassword: Joi.string().trim(),
      newPassword: Joi.string().trim(),
      firstName: Joi.string().trim().required(),
      lastName: Joi.string().trim().required(),
      timezoneOffSet: Joi.number().min(-720).max(840).required(),
    }),
  }),
  updateUserController.handle
);
usersRouter.patch(
  "/avatar",
  ensureAuthentication,
  multerMiddleware.single("avatar"),
  updateAvatarController.handle
);

export { usersRouter };
