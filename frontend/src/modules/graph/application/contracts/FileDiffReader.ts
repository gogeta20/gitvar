export interface FileDiffReader {
  readFileDiff(repositoryPath: string, commitId: string, filePath: string): Promise<string>;
}
