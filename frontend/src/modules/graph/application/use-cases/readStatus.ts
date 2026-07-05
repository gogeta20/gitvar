import { StatusReader } from "@modules/graph/application/contracts/StatusReader";
import { WorkingStatus } from "@modules/graph/domain/workingStatus";

export async function readStatus(
  statusReader: StatusReader,
  repositoryPath: string
): Promise<WorkingStatus> {
  return statusReader.readStatus(repositoryPath);
}
