import { StashReader } from "@modules/stash/application/contracts/StashReader";
import { StashEntry } from "@modules/stash/domain/stashEntry";

export async function readStash(
  stashReader: StashReader,
  repositoryPath: string
): Promise<StashEntry[]> {
  return stashReader.readStash(repositoryPath);
}
