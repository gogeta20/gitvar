import { WorkingChangesWriter } from "@modules/graph/application/contracts/WorkingChangesWriter";

export async function stageAll(
  workingChangesWriter: WorkingChangesWriter,
  repositoryPath: string
): Promise<void> {
  return workingChangesWriter.stageAll(repositoryPath);
}
