export interface Branch {
  name: string;
  fullRef: string;
  isRemote: boolean;
  isCurrent: boolean;
  createdAt: string | null;
  targetCommit: string;
}
