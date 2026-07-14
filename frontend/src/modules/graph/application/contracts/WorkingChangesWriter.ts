export interface WorkingChangesWriter {
  stageFile(repositoryPath: string, filePath: string): Promise<void>;
  unstageFile(repositoryPath: string, filePath: string): Promise<void>;
  discardFile(repositoryPath: string, filePath: string): Promise<void>;
  stageHunk(repositoryPath: string, filePath: string, hunk: string): Promise<void>;
  discardHunk(repositoryPath: string, filePath: string, hunk: string): Promise<void>;
  unstageHunk(repositoryPath: string, filePath: string, hunk: string): Promise<void>;
  stageAll(repositoryPath: string): Promise<void>;
  discardAll(repositoryPath: string): Promise<void>;
}
