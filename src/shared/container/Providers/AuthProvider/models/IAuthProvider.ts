import { ITokenGenerate } from "../dtos/ITokenGenerate";
import { IVerifyToken } from "../dtos/IVerifyToken";

interface IAuthProvider {
  generateToken(data: ITokenGenerate): string;
  verifyToken(data: IVerifyToken): string;
}

export { IAuthProvider };
