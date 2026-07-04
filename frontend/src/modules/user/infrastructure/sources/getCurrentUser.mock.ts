import { parseUserDto } from "@modules/user/infrastructure/parsers/parseUserDto";
import { User } from "@modules/user/domain/user";

export async function getCurrentUserFromMock(): Promise<User> {
  return parseUserDto({
    id: "user-001",
    name: "Mau",
    email: "mau@example.dev",
    role: "founder"
  });
}

