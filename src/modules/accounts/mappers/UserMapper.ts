import { IUserResponse } from "../dtos/IUserResponse";
import { User } from "../infra/typeorm/entities/User";
import uploadConfig from "@config/upload";

class UserMapper {
  public static toDTO({ password, avatar, ...user }: User): IUserResponse {
    const generateAvatarUrl = () => {
      if (avatar) {
        switch (uploadConfig.driver) {
          case "disk":
            return `${process.env.API_URL}:${process.env.API_PORT}/files/${avatar}`;
          case "s3":
            return `https://s3.sa-east-1.amazonaws.com/${process.env.AWS_S3_AVATARS_BUCKETS}/${avatar}`;
          default:
            return null;
        }
      } else {
        return null;
      }
    };
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      timezoneOffSet: user.timezoneOffSet,
      avatarUrl: generateAvatarUrl(),
    };
  }
}

export { UserMapper };
