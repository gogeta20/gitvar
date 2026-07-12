const FILE_DIFF_API_URL = "http://127.0.0.1:7879/api/file-diff";

export async function readFileDiffFromApi(
  repositoryPath: string,
  commitId: string,
  filePath: string
): Promise<string> {
  const response = await fetch(
    `${FILE_DIFF_API_URL}?repoPath=${encodeURIComponent(repositoryPath)}&commitId=${encodeURIComponent(commitId)}&path=${encodeURIComponent(filePath)}`
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to load file diff from backend. ${text}`);
  }

  const body: { diff: string } = await response.json();
  return body.diff;
}
