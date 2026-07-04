import { UserReader } from "@modules/user/application/contracts/UserReader";
import { createDataSourceResolver } from "@shared/lib/createDataSourceResolver";
import { getCurrentUserFromApi } from "@modules/user/infrastructure/sources/getCurrentUser.api";
import { getCurrentUserFromMock } from "@modules/user/infrastructure/sources/getCurrentUser.mock";

export function createUserReader(): UserReader {
  return {
    getCurrentUser: createDataSourceResolver({
      api: getCurrentUserFromApi,
      mock: getCurrentUserFromMock
    })
  };
}

