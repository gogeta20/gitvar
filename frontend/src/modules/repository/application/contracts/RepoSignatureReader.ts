export interface RepoSignatureReader {
  readRepoSignature(repositoryPath: string): Promise<string>;
}
