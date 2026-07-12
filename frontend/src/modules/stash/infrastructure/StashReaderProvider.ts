import { StashReader } from "@modules/stash/application/contracts/StashReader";
import { readStashFromApi } from "@modules/stash/infrastructure/sources/readStash.api";

export function createStashReader(): StashReader {
  return {
    readStash: readStashFromApi
  };
}
