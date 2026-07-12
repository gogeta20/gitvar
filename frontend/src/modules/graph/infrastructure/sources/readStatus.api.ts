import { API_BASE_URL } from "@core/config/api";
import { WorkingStatus } from "@modules/graph/domain/workingStatus";
import { parseStatusDto } from "@modules/graph/infrastructure/parsers/parseStatusDto";

const STATUS_API_URL = `${API_BASE_URL}/api/status`;

export async function readStatusFromApi(
  repositoryPath: string
): Promise<WorkingStatus> {
  const response = await fetch(
    `${STATUS_API_URL}?repoPath=${encodeURIComponent(repositoryPath)}`
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to load working status from backend. ${text}`);
  }

  return parseStatusDto(await response.json());
}
