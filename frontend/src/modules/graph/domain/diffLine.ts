export type DiffLineType = "added" | "removed" | "hunk" | "meta" | "context";

export interface DiffLine {
  type: DiffLineType;
  content: string;
}
