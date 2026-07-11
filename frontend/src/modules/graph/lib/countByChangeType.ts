import { FileChange } from "@modules/graph/domain/fileChange";

export function countByChangeType(files: FileChange[], changeTypes: FileChange["changeType"][]): number {
  return files.filter((file) => changeTypes.includes(file.changeType)).length;
}
