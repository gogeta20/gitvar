import { BranchReader } from "@modules/branches/application/contracts/BranchReader";
import { Branch } from "@modules/branches/domain/branch";

export async function readBranches(
  branchReader: BranchReader,
  repositoryPath: string
): Promise<Branch[]> {
  return branchReader.readBranches(repositoryPath);
}

