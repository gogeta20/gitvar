import { API_BASE_URL } from "@core/config/api";
import { DirectoryListing } from "@modules/repository/domain/directoryListing";
import { parseDirectoryListingDto } from "@modules/repository/infrastructure/parsers/parseDirectoryListingDto";

const BROWSE_DIRECTORY_API_URL = `${API_BASE_URL}/api/browse-directory`;

export async function browseDirectoryFromApi(path?: string): Promise<DirectoryListing> {
  const url = path
    ? `${BROWSE_DIRECTORY_API_URL}?path=${encodeURIComponent(path)}`
    : BROWSE_DIRECTORY_API_URL;

  const response = await fetch(url);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to browse directory. ${text}`);
  }

  return parseDirectoryListingDto(await response.json());
}
