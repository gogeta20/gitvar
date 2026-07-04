import { RepositoryWorkspace } from "@modules/repository/domain/repository";

export interface RepositoryReader {
  loadWorkspace(): Promise<RepositoryWorkspace>;
}

