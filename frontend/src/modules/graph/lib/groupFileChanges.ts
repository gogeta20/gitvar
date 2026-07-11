import { FileChange } from "@modules/graph/domain/fileChange";

export interface FileChangeGroup {
  path: string;
  files: FileChange[];
}

const ROOT_GROUP_PATH = "(root)";

export function groupPathForFile(filePath: string): string {
  const separatorIndex = filePath.indexOf("/");
  return separatorIndex === -1 ? ROOT_GROUP_PATH : filePath.slice(0, separatorIndex);
}

export function groupFileChanges(files: FileChange[]): FileChangeGroup[] {
  const groupsByPath = new Map<string, FileChange[]>();

  for (const file of files) {
    const groupPath = groupPathForFile(file.path);

    const groupFiles = groupsByPath.get(groupPath) ?? [];
    groupFiles.push(file);
    groupsByPath.set(groupPath, groupFiles);
  }

  return Array.from(groupsByPath.entries()).map(([path, groupFiles]) => ({
    path,
    files: groupFiles
  }));
}

export function countByChangeType(files: FileChange[], changeTypes: FileChange["changeType"][]): number {
  return files.filter((file) => changeTypes.includes(file.changeType)).length;
}
