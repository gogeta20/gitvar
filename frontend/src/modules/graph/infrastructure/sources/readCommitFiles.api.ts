import { API_BASE_URL } from "@core/config/api";
import { FileChange } from "@modules/graph/domain/fileChange";
import { parseCommitFilesDto } from "@modules/graph/infrastructure/parsers/parseCommitFilesDto";

const COMMIT_FILES_API_URL = `${API_BASE_URL}/api/commit-files`;

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
