import { DirectoryBrowser } from "@modules/repository/application/contracts/DirectoryBrowser";
import { browseDirectoryFromApi } from "@modules/repository/infrastructure/sources/browseDirectory.api";

export function createDirectoryBrowser(): DirectoryBrowser {
  return {
    browseDirectory: browseDirectoryFromApi
  };
}
