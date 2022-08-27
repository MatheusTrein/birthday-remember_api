import { IUserResponse } from "@modules/accounts/dtos/IUserResponse";
import { UserMapper } from "@modules/accounts/mappers/UserMapper";
import { IUsersRepository } from "@modules/accounts/repositories/IUsersRepository";
import { IStorageProvider } from "@shared/container/Providers/StorageProvider/models/IStorageProvider";
import { AppError } from "@shared/errors/AppError";
import { inject, injectable } from "tsyringe";

interface IRequest {
  fileName: string;
  userId: string;
}

@injectable()
class UpdateAvatarUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
    @inject("StorageProvider")
    private storageProvider: IStorageProvider
  ) {}

  async execute({ fileName, userId }: IRequest): Promise<IUserResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      this.storageProvider.clearTmpFolder();
      throw new AppError({
        message: "Only authenticated user can change avatar",
        statusCode: 401,
      });
    }

    if (user.avatar) {
      await this.storageProvider.deleteFile(user.avatar);
    }

    user.avatar = fileName;

    await this.usersRepository.save(user);
    await this.storageProvider.saveFile(fileName);

    return UserMapper.toDTO(user);
  }
}
export { UpdateAvatarUseCase };
