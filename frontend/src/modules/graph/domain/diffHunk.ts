export type DiffLineType = "added" | "removed" | "context";

export interface DiffHunkLine {
  type: DiffLineType;
  content: string;
  oldLineNumber: number | null;
  newLineNumber: number | null;
}

export interface DiffHunk {
  header: string;
  lines: DiffHunkLine[];
}
