import { DiffHunk } from "@modules/graph/domain/diffHunk";

const HUNK_HEADER_PATTERN = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/;

export function parseDiffHunks(diffText: string): DiffHunk[] {
  if (!diffText) {
    return [];
  }

  const hunks: DiffHunk[] = [];
  let currentHunk: DiffHunk | null = null;
  let oldLineNumber = 0;
  let newLineNumber = 0;

  for (const line of diffText.split("\n")) {
    const headerMatch = line.match(HUNK_HEADER_PATTERN);

    if (headerMatch) {
      oldLineNumber = Number(headerMatch[1]);
      newLineNumber = Number(headerMatch[2]);
      currentHunk = { header: line, lines: [] };
      hunks.push(currentHunk);
      continue;
    }

    if (!currentHunk || line.startsWith("\\")) {
      continue;
    }

    if (line.startsWith("+")) {
      currentHunk.lines.push({
        type: "added",
        content: line.slice(1),
        oldLineNumber: null,
        newLineNumber
      });
      newLineNumber += 1;
    } else if (line.startsWith("-")) {
      currentHunk.lines.push({
        type: "removed",
        content: line.slice(1),
        oldLineNumber,
        newLineNumber: null
      });
      oldLineNumber += 1;
    } else {
      currentHunk.lines.push({
        type: "context",
        content: line.startsWith(" ") ? line.slice(1) : line,
        oldLineNumber,
        newLineNumber
      });
      oldLineNumber += 1;
      newLineNumber += 1;
    }
  }

  return hunks;
}
