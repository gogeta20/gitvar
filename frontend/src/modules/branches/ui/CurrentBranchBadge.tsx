import { useEffect, useState } from "react";
import { GitBranch } from "lucide-react";
import { readBranches } from "@modules/branches/application/use-cases/readBranches";
import { createBranchReader } from "@modules/branches/infrastructure/BranchReaderProvider";
import styles from "./CurrentBranchBadge.module.css";

interface CurrentBranchBadgeProps {
  repositoryPath: string;
}

export function CurrentBranchBadge({ repositoryPath }: CurrentBranchBadgeProps) {
  const [currentBranchName, setCurrentBranchName] = useState<string | null>(null);

  useEffect(() => {
    const branchReader = createBranchReader();

    readBranches(branchReader, repositoryPath)
      .then((branches) => {
        setCurrentBranchName(branches.find((branch) => branch.isCurrent)?.name ?? null);
      })
      .catch(() => setCurrentBranchName(null));
  }, [repositoryPath]);

  if (!currentBranchName) {
    return null;
  }

  return (
    <span className={styles.badge} title="Current branch">
      <GitBranch size={13} />
      {currentBranchName}
    </span>
  );
}
