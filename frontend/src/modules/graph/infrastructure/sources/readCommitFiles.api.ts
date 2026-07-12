import { FileChange } from "@modules/graph/domain/fileChange";
import { parseCommitFilesDto } from "@modules/graph/infrastructure/parsers/parseCommitFilesDto";

const COMMIT_FILES_API_URL = "http://127.0.0.1:7879/api/commit-files";

export async function readCommitFilesFromApi(
  repositoryPath: string,
  commitId: string
): Promise<FileChange[]> {
  const response = await fetch(
    `${COMMIT_FILES_API_URL}?repoPath=${encodeURIComponent(repositoryPath)}&commitId=${encodeURIComponent(commitId)}`
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to load commit files from backend. ${text}`);
  }

  return parseCommitFilesDto(await response.json());
}
