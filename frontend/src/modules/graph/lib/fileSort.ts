import { FileChange } from "@modules/graph/domain/fileChange";

export type FileSortMode = "az" | "za" | "status";

const STATUS_ORDER: Record<FileChange["changeType"], number> = {
  added: 0,
  untracked: 0,
  renamed: 1,
  modified: 1,
  deleted: 2
};

export function compareFilesBySortMode(mode: FileSortMode) {
  return (a: FileChange, b: FileChange): number => {
    if (mode === "status") {
      const statusDiff = STATUS_ORDER[a.changeType] - STATUS_ORDER[b.changeType];
      return statusDiff !== 0 ? statusDiff : a.path.localeCompare(b.path);
    }

    const alphabetical = a.path.localeCompare(b.path);
    return mode === "za" ? -alphabetical : alphabetical;
  };
}

export function nextSortMode(mode: FileSortMode): FileSortMode {
  if (mode === "az") {
    return "za";
  }

  if (mode === "za") {
    return "status";
  }

  return "az";
}

export function sortModeLabel(mode: FileSortMode): string {
  if (mode === "az") {
    return "Sort: A → Z";
  }

  if (mode === "za") {
    return "Sort: Z → A";
  }

  return "Sort: by status";
}
