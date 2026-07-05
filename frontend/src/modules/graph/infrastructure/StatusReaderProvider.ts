import { StatusReader } from "@modules/graph/application/contracts/StatusReader";
import { readStatusFromApi } from "@modules/graph/infrastructure/sources/readStatus.api";

export function createStatusReader(): StatusReader {
  return {
    readStatus: readStatusFromApi
  };
}
