import { inject, injectable } from "tsyringe";

import { BirthdayPerson } from "@modules/birthdayPersons/infra/typeorm/entities/BirthdayPerson";
import { IBirthdayPersonsRepository } from "@modules/birthdayPersons/repositories/IBirthdayPersonsRepository";
import { IUsersRepository } from "@modules/accounts/repositories/IUsersRepository";
import { AppError } from "@shared/errors/AppError";
import { ICacheProvider } from "@shared/container/Providers/CacheProvider/models/ICacheProvider";

interface IRequest {
  page: number;
  perPage: number;
  userId: string;
}

interface IResponse {
  birthdayPersons: BirthdayPerson[];
  totalCount: number;
}

@injectable()
class ListAllBirthdayPersonsUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
    @inject("BirthdayPersonsRepository")
    private birthdayPersonsRepository: IBirthdayPersonsRepository,
    @inject("CacheProvider")
    private cacheProvider: ICacheProvider
  ) {}

  async execute({ page, perPage, userId }: IRequest): Promise<IResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new AppError({
        message: "Only logged user can list all birthdays",
        statusCode: 401,
      });
    }

    const cacheKey = `birthdayPersons:-${user.id}`;

    let birthdayPersons = await this.cacheProvider.recover<BirthdayPerson[]>(
      cacheKey
    );

    if (!birthdayPersons) {
      birthdayPersons = await this.birthdayPersonsRepository.listAllByUser(
        userId
      );

      await this.cacheProvider.save(cacheKey, birthdayPersons);
    }

    const totalCount = birthdayPersons.length;
    const pageStart = (page - 1) * perPage;
    const pageEnd = pageStart + perPage;

    birthdayPersons = birthdayPersons.slice(pageStart, pageEnd);

    return {
      birthdayPersons,
      totalCount,
    };
  }
}

export { ListAllBirthdayPersonsUseCase };
