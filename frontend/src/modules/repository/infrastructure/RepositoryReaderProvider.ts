import { RepositoryReader } from "@modules/repository/application/contracts/RepositoryReader";
import { loadRepositoryWorkspaceFromApi } from "@modules/repository/infrastructure/sources/loadRepositoryWorkspace.api";
import { loadRepositoryWorkspaceFromMock } from "@modules/repository/infrastructure/sources/loadRepositoryWorkspace.mock";
import { createDataSourceResolver } from "@shared/lib/createDataSourceResolver";

export function createRepositoryReader(): RepositoryReader {
  return {
    loadWorkspace: createDataSourceResolver({
      api: loadRepositoryWorkspaceFromApi,
      mock: loadRepositoryWorkspaceFromMock
    })
  };
}

