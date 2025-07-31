import { JwtPayload } from "jsonwebtoken";

export type DecodedToken = JwtPayload & {
  userId: string;
  email?: string;
};
