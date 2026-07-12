import { RepoSignatureReader } from "@modules/repository/application/contracts/RepoSignatureReader";
import { readRepoSignatureFromApi } from "@modules/repository/infrastructure/sources/readRepoSignature.api";

export function createRepoSignatureReader(): RepoSignatureReader {
  return {
    readRepoSignature: readRepoSignatureFromApi
  };
}
