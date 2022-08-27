import { Request, Response } from "express";
import { container } from "tsyringe";

import { UpdateUserUseCase } from "./UpdateUserUseCase";

class UpdateUserController {
  async handle(request: Request, response: Response): Promise<Response> {
    const file = request.file as Express.Multer.File;
    let fileName = "";
    if (file) {
      fileName = file.filename;
    }
    const { firstName, lastName, timezoneOffSet, newPassword, oldPassword } =
      request.body;
    const { id: userId } = request.user;

    const updateUserUseCase = container.resolve(UpdateUserUseCase);

    const updatedUser = await updateUserUseCase.execute({
      firstName,
      lastName,
      timezoneOffSet,
      userId,
      avatar: fileName,
      newPassword,
      oldPassword,
    });

    return response.json(updatedUser);
  }
}

export { UpdateUserController };
