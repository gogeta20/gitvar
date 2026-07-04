import { parseUserDto } from "@modules/user/infrastructure/parsers/parseUserDto";
import { User } from "@modules/user/domain/user";

export async function getCurrentUserFromApi(): Promise<User> {
  const response = await fetch("/api/user/me");

  if (!response.ok) {
    throw new Error("Failed to load current user from API.");
  }

  const data = (await response.json()) as {
    id: string;
    name: string;
    email: string;
    role: string;
  };

  return parseUserDto(data);
}

