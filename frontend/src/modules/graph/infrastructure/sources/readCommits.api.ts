import { Commit } from "@modules/graph/domain/commit";
import { parseCommitsDto } from "@modules/graph/infrastructure/parsers/parseCommitsDto";

const COMMITS_API_URL = "http://127.0.0.1:7878/api/commits";

export async function readCommitsFromApi(
  repositoryPath: string
): Promise<Commit[]> {
  const response = await fetch(
    `${COMMITS_API_URL}?repoPath=${encodeURIComponent(repositoryPath)}`
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to load commits from backend. ${text}`);
  }

  return parseCommitsDto(await response.json());
}
