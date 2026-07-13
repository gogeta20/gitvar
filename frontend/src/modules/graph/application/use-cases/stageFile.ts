import { WorkingChangesWriter } from "@modules/graph/application/contracts/WorkingChangesWriter";

export async function stageFile(
  workingChangesWriter: WorkingChangesWriter,
  repositoryPath: string,
  filePath: string
): Promise<void> {
  return workingChangesWriter.stageFile(repositoryPath, filePath);
}
