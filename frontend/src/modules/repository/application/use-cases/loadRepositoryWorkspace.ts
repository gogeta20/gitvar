import { RepositoryReader } from "@modules/repository/application/contracts/RepositoryReader";
import { RepositoryWorkspace } from "@modules/repository/domain/repository";

export async function loadRepositoryWorkspace(
  repositoryReader: RepositoryReader
): Promise<RepositoryWorkspace> {
  return repositoryReader.loadWorkspace();
}

