import { RepositoryWorkspace } from "@modules/repository/domain/repository";
import { parseRepositoryWorkspaceDto } from "@modules/repository/infrastructure/parsers/parseRepositoryWorkspaceDto";

export async function loadRepositoryWorkspaceFromApi(): Promise<RepositoryWorkspace> {
  const response = await fetch("/api/repository/workspace");

  if (!response.ok) {
    throw new Error("Failed to load repository workspace from API.");
  }

  return parseRepositoryWorkspaceDto(await response.json());
}

