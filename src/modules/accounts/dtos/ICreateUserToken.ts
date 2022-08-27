interface ICreateUserToken {
  userId: string;
  type: string;
  expiresIn?: Date;
}

export { ICreateUserToken };
