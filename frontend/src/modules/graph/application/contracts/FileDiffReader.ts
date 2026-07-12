export interface FileDiffReader {
  readFileDiff(
    repositoryPath: string,
    commitId: string,
    filePath: string,
    staged?: boolean
  ): Promise<string>;
}
