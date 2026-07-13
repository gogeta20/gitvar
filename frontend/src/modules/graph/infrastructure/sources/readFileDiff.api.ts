import { API_BASE_URL } from "@core/config/api";

const FILE_DIFF_API_URL = `${API_BASE_URL}/api/file-diff`;

export async function readFileDiffFromApi(
  repositoryPath: string,
  commitId: string,
  filePath: string,
  staged?: boolean
): Promise<string> {
  const stagedParam = staged ? "&staged=true" : "";
  const response = await fetch(
    `${FILE_DIFF_API_URL}?repoPath=${encodeURIComponent(repositoryPath)}&commitId=${encodeURIComponent(commitId)}&path=${encodeURIComponent(filePath)}${stagedParam}`
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to load file diff from backend. ${text}`);
  }

  const body: { diff: string } = await response.json();
  return body.diff;
}
