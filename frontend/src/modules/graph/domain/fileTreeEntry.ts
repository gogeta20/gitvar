import { FileChange } from "@modules/graph/domain/fileChange";

export interface FileTreeFolder {
  type: "folder";
  name: string;
  path: string;
  children: FileTreeEntry[];
}

export interface FileTreeFile {
  type: "file";
  name: string;
  path: string;
  file: FileChange;
}

export type FileTreeEntry = FileTreeFolder | FileTreeFile;
