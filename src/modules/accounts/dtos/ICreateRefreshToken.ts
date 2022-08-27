interface ICreateRefreshToken {
  ip: string;
  isMobile: boolean;
  userId: string;
  expiresIn: Date;
}

export { ICreateRefreshToken };
