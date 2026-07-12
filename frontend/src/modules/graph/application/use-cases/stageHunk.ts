import { WorkingChangesWriter } from "@modules/graph/application/contracts/WorkingChangesWriter";

export async function stageHunk(
  workingChangesWriter: WorkingChangesWriter,
  repositoryPath: string,
  filePath: string,
  hunk: string
): Promise<void> {
  return workingChangesWriter.stageHunk(repositoryPath, filePath, hunk);
}
