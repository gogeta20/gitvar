import { UserReader } from "@modules/user/application/contracts/UserReader";
import { User } from "@modules/user/domain/user";

export async function getCurrentUser(userReader: UserReader): Promise<User> {
  return userReader.getCurrentUser();
}

