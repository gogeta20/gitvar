import { WorkingChangesWriter } from "@modules/graph/application/contracts/WorkingChangesWriter";

export async function discardAll(
  workingChangesWriter: WorkingChangesWriter,
  repositoryPath: string
): Promise<void> {
  return workingChangesWriter.discardAll(repositoryPath);
}
