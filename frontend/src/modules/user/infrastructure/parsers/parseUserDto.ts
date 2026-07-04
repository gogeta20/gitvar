import { User } from "@modules/user/domain/user";

interface UserDto {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function parseUserDto(input: UserDto): User {
  return {
    id: input.id,
    name: input.name,
    email: input.email,
    role: input.role
  };
}

