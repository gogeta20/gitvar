import { FileChange } from "@modules/graph/domain/fileChange";

export function changeTypeLetter(changeType: FileChange["changeType"]): string {
  switch (changeType) {
    case "added":
      return "A";
    case "modified":
      return "M";
    case "deleted":
      return "D";
    case "renamed":
      return "R";
    case "untracked":
      return "U";
  }
}
