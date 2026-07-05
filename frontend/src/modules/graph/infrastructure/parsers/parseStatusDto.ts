import { WorkingStatus } from "@modules/graph/domain/workingStatus";

interface StatusResponseDto {
  isDirty: boolean;
  headCommitId: string;
}

export function parseStatusDto(input: StatusResponseDto): WorkingStatus {
  return {
    isDirty: input.isDirty,
    headCommitId: input.headCommitId
  };
}
