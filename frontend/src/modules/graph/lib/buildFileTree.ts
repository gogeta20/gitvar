import { FileChange } from "@modules/graph/domain/fileChange";
import { FileTreeEntry, FileTreeFolder } from "@modules/graph/domain/fileTreeEntry";

type FileComparator = (a: FileChange, b: FileChange) => number;

const defaultCompareFiles: FileComparator = (a, b) => a.path.localeCompare(b.path);

export function buildFileTree(
  files: FileChange[],
  compareFiles: FileComparator = defaultCompareFiles
): FileTreeEntry[] {
  const root: FileTreeFolder = { type: "folder", name: "", path: "", children: [] };

  for (const file of files) {
    const segments = file.path.split("/");
    let currentFolder = root;

    segments.forEach((segment, index) => {
      const segmentPath = currentFolder.path ? `${currentFolder.path}/${segment}` : segment;
      const isFileSegment = index === segments.length - 1;

      if (isFileSegment) {
        currentFolder.children.push({ type: "file", name: segment, path: segmentPath, file });
        return;
      }

      const existingFolder = currentFolder.children.find(
        (entry): entry is FileTreeFolder => entry.type === "folder" && entry.name === segment
      );

      if (existingFolder) {
        currentFolder = existingFolder;
        return;
      }

      const newFolder: FileTreeFolder = { type: "folder", name: segment, path: segmentPath, children: [] };
      currentFolder.children.push(newFolder);
      currentFolder = newFolder;
    });
  }

  sortEntries(root.children, compareFiles);
  return root.children;
}

function sortEntries(entries: FileTreeEntry[], compareFiles: FileComparator): void {
  entries.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "folder" ? -1 : 1;
    }

    if (a.type === "file" && b.type === "file") {
      return compareFiles(a.file, b.file);
    }

    return a.name.localeCompare(b.name);
  });

  for (const entry of entries) {
    if (entry.type === "folder") {
      sortEntries(entry.children, compareFiles);
    }
  }
}

export function collectFilesInEntry(entry: FileTreeEntry): FileChange[] {
  if (entry.type === "file") {
    return [entry.file];
  }

  return entry.children.flatMap(collectFilesInEntry);
}

export function collectFolderPaths(entries: FileTreeEntry[]): string[] {
  const paths: string[] = [];

  for (const entry of entries) {
    if (entry.type === "folder") {
      paths.push(entry.path);
      paths.push(...collectFolderPaths(entry.children));
    }
  }

  return paths;
}

export function ancestorFolderPaths(filePath: string): string[] {
  const segments = filePath.split("/").slice(0, -1);
  const paths: string[] = [];
  let currentPath = "";

  for (const segment of segments) {
    currentPath = currentPath ? `${currentPath}/${segment}` : segment;
    paths.push(currentPath);
  }

  return paths;
}
