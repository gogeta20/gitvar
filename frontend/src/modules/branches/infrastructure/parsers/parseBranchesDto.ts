import { Branch } from "@modules/branches/domain/branch";

interface BranchDto {
  name: string;
  fullRef: string;
  isRemote: boolean;
  isCurrent: boolean;
  createdAt: string;
  targetCommit: string;
}

interface BranchResponseDto {
  branches: BranchDto[];
}

export function parseBranchesDto(input: BranchResponseDto): Branch[] {
  return input.branches.map((branch) => ({
    name: branch.name,
    fullRef: branch.fullRef,
    isRemote: branch.isRemote,
    isCurrent: branch.isCurrent,
    createdAt: branch.createdAt || null,
    targetCommit: branch.targetCommit
  }));
}
