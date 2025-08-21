import { AxiosError } from "axios";

export const is401 = (err: unknown): boolean => {
  return err instanceof AxiosError && err.response?.status === 401;
};
