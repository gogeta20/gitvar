import { DirectoryListing } from "@modules/repository/domain/directoryListing";

interface DirectoryEntryDto {
  name: string;
  path: string;
  isGitRepo: boolean;
}

interface DirectoryListingDto {
  currentPath: string;
  parentPath: string | null;
  entries: DirectoryEntryDto[];
}

export function parseDirectoryListingDto(input: DirectoryListingDto): DirectoryListing {
  return {
    currentPath: input.currentPath,
    parentPath: input.parentPath,
    entries: input.entries.map((entry) => ({
      name: entry.name,
      path: entry.path,
      isGitRepo: entry.isGitRepo
    }))
  };
}
