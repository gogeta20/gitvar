import { WorkingStatus } from "@modules/graph/domain/workingStatus";

export interface StatusReader {
  readStatus(repositoryPath: string): Promise<WorkingStatus>;
}
