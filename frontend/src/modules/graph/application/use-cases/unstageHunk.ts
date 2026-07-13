import { WorkingChangesWriter } from "@modules/graph/application/contracts/WorkingChangesWriter";

export async function unstageHunk(
  workingChangesWriter: WorkingChangesWriter,
  repositoryPath: string,
  filePath: string,
  hunk: string
): Promise<void> {
  return workingChangesWriter.unstageHunk(repositoryPath, filePath, hunk);
}
