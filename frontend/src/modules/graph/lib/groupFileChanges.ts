import { FileChange } from "@modules/graph/domain/fileChange";

export interface FileChangeGroup {
  path: string;
  files: FileChange[];
}

const ROOT_GROUP_PATH = "(root)";

export function groupFileChanges(files: FileChange[]): FileChangeGroup[] {
  const groupsByPath = new Map<string, FileChange[]>();

  for (const file of files) {
    const separatorIndex = file.path.indexOf("/");
    const groupPath = separatorIndex === -1 ? ROOT_GROUP_PATH : file.path.slice(0, separatorIndex);

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
