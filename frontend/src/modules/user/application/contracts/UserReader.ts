import { User } from "@modules/user/domain/user";

export interface UserReader {
  getCurrentUser(): Promise<User>;
}

