import { FileChange } from "@modules/graph/domain/fileChange";

interface FileChangeDto {
  path: string;
  changeType: FileChange["changeType"];
}

interface CommitFilesResponseDto {
  files: FileChangeDto[];
}

export function parseCommitFilesDto(input: CommitFilesResponseDto): FileChange[] {
  return input.files.map((file) => ({
    path: file.path,
    changeType: file.changeType
  }));
}
