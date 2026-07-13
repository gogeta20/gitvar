import { WorkingChangesWriter } from "@modules/graph/application/contracts/WorkingChangesWriter";

export async function discardFile(
  workingChangesWriter: WorkingChangesWriter,
  repositoryPath: string,
  filePath: string
): Promise<void> {
  return workingChangesWriter.discardFile(repositoryPath, filePath);
}
