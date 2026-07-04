import { BranchReader } from "@modules/branches/application/contracts/BranchReader";
import { readBranchesFromApi } from "@modules/branches/infrastructure/sources/readBranches.api";

export function createBranchReader(): BranchReader {
  return {
    readBranches: readBranchesFromApi
  };
}

