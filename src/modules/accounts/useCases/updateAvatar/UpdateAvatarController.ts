import { Request, Response } from "express";
import { container } from "tsyringe";

import { UpdateAvatarUseCase } from "./UpdateAvatarUseCase";

class UpdateAvatarController {
  async handle(request: Request, response: Response): Promise<Response> {
    const file = request.file as Express.Multer.File;
    const fileName = file.filename;
    const userId = request.user.id;

    const updateAvatarUseCase = container.resolve(UpdateAvatarUseCase);

    const userWithAvatarUpdated = await updateAvatarUseCase.execute({
      fileName: fileName as string,
      userId,
    });

    return response.json(userWithAvatarUpdated);
  }
}

export { UpdateAvatarController };
