import { Branch } from "@modules/branches/domain/branch";

export interface BranchReader {
  readBranches(repositoryPath: string): Promise<Branch[]>;
}

