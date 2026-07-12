import { DiffHunk } from "@modules/graph/domain/diffHunk";

function linePrefix(type: DiffHunk["lines"][number]["type"]): string {
  if (type === "added") {
    return "+";
  }

  if (type === "removed") {
    return "-";
  }

  return " ";
}

export function buildHunkPatchText(hunk: DiffHunk): string {
  const lines = hunk.lines.map((line) => `${linePrefix(line.type)}${line.content}`);

  return [hunk.header, ...lines].join("\n");
}
