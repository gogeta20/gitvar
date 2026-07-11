import { FileDiffReader } from "@modules/graph/application/contracts/FileDiffReader";
import { readFileDiffFromApi } from "@modules/graph/infrastructure/sources/readFileDiff.api";

export function createFileDiffReader(): FileDiffReader {
  return {
    readFileDiff: readFileDiffFromApi
  };
}
