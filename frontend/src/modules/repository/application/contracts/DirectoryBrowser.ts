import { DirectoryListing } from "@modules/repository/domain/directoryListing";

export interface DirectoryBrowser {
  browseDirectory(path?: string): Promise<DirectoryListing>;
}
