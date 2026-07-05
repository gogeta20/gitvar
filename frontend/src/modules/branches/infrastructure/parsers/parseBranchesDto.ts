import { Branch } from "@modules/branches/domain/branch";

interface BranchDto {
  name: string;
  fullRef: string;
  isRemote: boolean;
  isCurrent: boolean;
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
    targetCommit: branch.targetCommit
  }));
}
