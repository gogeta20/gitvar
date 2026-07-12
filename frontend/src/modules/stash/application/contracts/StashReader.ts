import { StashEntry } from "@modules/stash/domain/stashEntry";

export interface StashReader {
  readStash(repositoryPath: string): Promise<StashEntry[]>;
}
