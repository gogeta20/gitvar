import { API_BASE_URL } from "@core/config/api";

async function postFileAction(endpoint: string, repositoryPath: string, filePath: string): Promise<void> {
  const url = `${API_BASE_URL}${endpoint}?repoPath=${encodeURIComponent(repositoryPath)}&path=${encodeURIComponent(filePath)}`;

  const response = await fetch(url, { method: "POST" });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request to ${endpoint} failed. ${text}`);
  }
}

export async function stageFileFromApi(repositoryPath: string, filePath: string): Promise<void> {
  return postFileAction("/api/stage-file", repositoryPath, filePath);
}

export async function unstageFileFromApi(repositoryPath: string, filePath: string): Promise<void> {
  return postFileAction("/api/unstage-file", repositoryPath, filePath);
}

export async function discardFileFromApi(repositoryPath: string, filePath: string): Promise<void> {
  return postFileAction("/api/discard-file", repositoryPath, filePath);
}

async function postHunkAction(
  endpoint: string,
  repositoryPath: string,
  filePath: string,
  hunk: string
): Promise<void> {
  const url = `${API_BASE_URL}${endpoint}?repoPath=${encodeURIComponent(repositoryPath)}&path=${encodeURIComponent(filePath)}&hunk=${encodeURIComponent(hunk)}`;

  const response = await fetch(url, { method: "POST" });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request to ${endpoint} failed. ${text}`);
  }
}

export async function stageHunkFromApi(
  repositoryPath: string,
  filePath: string,
  hunk: string
): Promise<void> {
  return postHunkAction("/api/stage-hunk", repositoryPath, filePath, hunk);
}

export async function discardHunkFromApi(
  repositoryPath: string,
  filePath: string,
  hunk: string
): Promise<void> {
  return postHunkAction("/api/discard-hunk", repositoryPath, filePath, hunk);
}

export async function unstageHunkFromApi(
  repositoryPath: string,
  filePath: string,
  hunk: string
): Promise<void> {
  return postHunkAction("/api/unstage-hunk", repositoryPath, filePath, hunk);
}
