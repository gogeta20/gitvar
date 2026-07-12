import { API_BASE_URL } from "@core/config/api";
import { Branch } from "@modules/branches/domain/branch";
import { parseBranchesDto } from "@modules/branches/infrastructure/parsers/parseBranchesDto";

const BRANCHES_API_URL = `${API_BASE_URL}/api/branches`;

export async function readBranchesFromApi(
  repositoryPath: string
): Promise<Branch[]> {
  const response = await fetch(
    `${BRANCHES_API_URL}?repoPath=${encodeURIComponent(repositoryPath)}`
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to load branches from backend. ${text}`);
  }

  return parseBranchesDto(await response.json());
}
