import { API_BASE_URL } from "@core/config/api";

const REPO_SIGNATURE_API_URL = `${API_BASE_URL}/api/repo-signature`;

export async function readRepoSignatureFromApi(repositoryPath: string): Promise<string> {
  const response = await fetch(
    `${REPO_SIGNATURE_API_URL}?repoPath=${encodeURIComponent(repositoryPath)}`
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to read repo signature. ${text}`);
  }

  const payload = (await response.json()) as { signature: string };

  return payload.signature;
}
