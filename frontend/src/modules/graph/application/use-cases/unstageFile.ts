import { WorkingChangesWriter } from "@modules/graph/application/contracts/WorkingChangesWriter";

export async function unstageFile(
  workingChangesWriter: WorkingChangesWriter,
  repositoryPath: string,
  filePath: string
): Promise<void> {
  return workingChangesWriter.unstageFile(repositoryPath, filePath);
}
