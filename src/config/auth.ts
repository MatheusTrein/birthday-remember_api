interface IAuthConfig {
  driver: "jwt";
  tokenExpireInMinutes: number;
  authSecret: string;
  refreshTokenExpiresInDays: number;
}

export default {
  driver: "jwt",
  tokenExpireInMinutes: 15,
  authSecret: process.env.AUTH_SECRET || "default",
  refreshTokenExpiresInDays: 30,
} as IAuthConfig;
