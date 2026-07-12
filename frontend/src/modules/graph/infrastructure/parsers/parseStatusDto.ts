import { FileChange } from "@modules/graph/domain/fileChange";
import { WorkingStatus } from "@modules/graph/domain/workingStatus";

interface FileChangeDto {
  path: string;
  changeType: FileChange["changeType"];
  isStaged: boolean;
}

interface StatusResponseDto {
  isDirty: boolean;
  headCommitId: string;
  changedFiles: FileChangeDto[];
}

export function parseStatusDto(input: StatusResponseDto): WorkingStatus {
  return {
    isDirty: input.isDirty,
    headCommitId: input.headCommitId,
    changedFiles: input.changedFiles.map((file) => ({
      path: file.path,
      changeType: file.changeType,
      isStaged: file.isStaged
    }))
  };
}
