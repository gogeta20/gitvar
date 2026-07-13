import { WorkingChangesWriter } from "@modules/graph/application/contracts/WorkingChangesWriter";

export async function discardHunk(
  workingChangesWriter: WorkingChangesWriter,
  repositoryPath: string,
  filePath: string,
  hunk: string
): Promise<void> {
  return workingChangesWriter.discardHunk(repositoryPath, filePath, hunk);
}
