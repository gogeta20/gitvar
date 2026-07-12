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
