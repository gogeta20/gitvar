import { RepoSignatureReader } from "@modules/repository/application/contracts/RepoSignatureReader";

export async function readRepoSignature(
  repoSignatureReader: RepoSignatureReader,
  repositoryPath: string
): Promise<string> {
  return repoSignatureReader.readRepoSignature(repositoryPath);
}
