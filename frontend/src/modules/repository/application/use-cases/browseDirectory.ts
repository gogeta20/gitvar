import { DirectoryBrowser } from "@modules/repository/application/contracts/DirectoryBrowser";
import { DirectoryListing } from "@modules/repository/domain/directoryListing";

export async function browseDirectory(
  directoryBrowser: DirectoryBrowser,
  path?: string
): Promise<DirectoryListing> {
  return directoryBrowser.browseDirectory(path);
}
