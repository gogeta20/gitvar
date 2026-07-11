import { DiffLine } from "@modules/graph/domain/diffLine";

const META_PREFIXES = ["diff --git", "index ", "--- ", "+++ ", "new file mode", "deleted file mode"];

export function parseDiffText(diffText: string): DiffLine[] {
  if (!diffText) {
    return [];
  }

  return diffText.split("\n").map((line) => ({ type: classifyLine(line), content: line }));
}

function classifyLine(line: string): DiffLine["type"] {
  if (META_PREFIXES.some((prefix) => line.startsWith(prefix))) {
    return "meta";
  }

  if (line.startsWith("@@")) {
    return "hunk";
  }

  if (line.startsWith("+")) {
    return "added";
  }

  if (line.startsWith("-")) {
    return "removed";
  }

  return "context";
}
