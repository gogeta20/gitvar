import { FileDiffReader } from "@modules/graph/application/contracts/FileDiffReader";

export async function readFileDiff(
  fileDiffReader: FileDiffReader,
  repositoryPath: string,
  commitId: string,
  filePath: string,
  staged?: boolean
): Promise<string> {
  return fileDiffReader.readFileDiff(repositoryPath, commitId, filePath, staged);
}
