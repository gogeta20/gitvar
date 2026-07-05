export interface Branch {
  name: string;
  fullRef: string;
  isRemote: boolean;
  isCurrent: boolean;
  targetCommit: string;
}
