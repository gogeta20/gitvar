export interface RepositorySummary {
  id: string;
  name: string;
  path: string;
  currentBranch: string;
  status: "clean" | "modified";
  ahead: number;
  behind: number;
}
