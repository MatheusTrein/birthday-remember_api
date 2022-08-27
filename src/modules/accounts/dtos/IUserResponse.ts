interface IUserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  timezoneOffSet: number;
}

export { IUserResponse };
