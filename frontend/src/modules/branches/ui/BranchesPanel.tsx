import { useEffect, useMemo, useState } from "react";
import { InfoCard } from "@core/components/InfoCard";
import { readBranches } from "@modules/branches/application/use-cases/readBranches";
import { Branch } from "@modules/branches/domain/branch";
import { createBranchReader } from "@modules/branches/infrastructure/BranchReaderProvider";
import styles from "./BranchesPanel.module.css";

interface BranchesPanelProps {
  repositoryPath: string;
}

export function BranchesPanel({
  repositoryPath
}: BranchesPanelProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const branchReader = createBranchReader();

    setError(null);

    readBranches(branchReader, repositoryPath)
      .then(setBranches)
      .catch((currentError: unknown) => {
        setBranches([]);
        setError(
          currentError instanceof Error ? currentError.message : "Unexpected error."
        );
      });
  }, [repositoryPath]);

  const orderedBranches = useMemo(() => {
    return [...branches].sort((left, right) => {
      if (left.isCurrent && !right.isCurrent) {
        return -1;
      }

      if (!left.isCurrent && right.isCurrent) {
        return 1;
      }

      if (left.isRemote !== right.isRemote) {
        return left.isRemote ? 1 : -1;
      }

      return left.name.localeCompare(right.name);
    });
  }, [branches]);

  return (
    <InfoCard title="Branches">
      {error ? <p className={styles.error}>{error}</p> : null}

      {!error ? (
        <div className={styles.branchList}>
          {orderedBranches.map((branch) => {
            const isActive = branch.isCurrent;

            return (
              <div
                key={branch.fullRef}
                className={isActive ? styles.branchItemActive : styles.branchItem}
              >
                <span className={isActive ? styles.branchNameActive : styles.branchName}>
                  {branch.name}
                </span>
              </div>
            );
          })}
        </div>
      ) : null}

      {!error && branches.length === 0 ? (
        <p className={styles.empty}>No branches returned by backend.</p>
      ) : null}
    </InfoCard>
  );
}
