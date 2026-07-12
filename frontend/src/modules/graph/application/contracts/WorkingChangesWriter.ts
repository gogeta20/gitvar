export interface WorkingChangesWriter {
  stageFile(repositoryPath: string, filePath: string): Promise<void>;
  unstageFile(repositoryPath: string, filePath: string): Promise<void>;
  discardFile(repositoryPath: string, filePath: string): Promise<void>;
}
