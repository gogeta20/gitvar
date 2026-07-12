import { StashEntry } from "@modules/stash/domain/stashEntry";
import { parseStashDto } from "@modules/stash/infrastructure/parsers/parseStashDto";

const STASH_API_URL = "http://127.0.0.1:7879/api/stash";

export async function readStashFromApi(repositoryPath: string): Promise<StashEntry[]> {
  const response = await fetch(
    `${STASH_API_URL}?repoPath=${encodeURIComponent(repositoryPath)}`
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to load stash from backend. ${text}`);
  }

  return parseStashDto(await response.json());
}
