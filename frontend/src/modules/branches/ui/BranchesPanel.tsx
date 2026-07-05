import { useEffect, useMemo, useState } from "react";
import { InfoCard } from "@core/components/InfoCard";
import { readBranches } from "@modules/branches/application/use-cases/readBranches";
import { Branch } from "@modules/branches/domain/branch";
import { createBranchReader } from "@modules/branches/infrastructure/BranchReaderProvider";
import styles from "./BranchesPanel.module.css";

interface BranchesPanelProps {
  repositoryPath: string;
  selectedBranchName: string | null;
  onSelectBranch: (branch: Branch) => void;
}

export function BranchesPanel({
  repositoryPath,
  selectedBranchName,
  onSelectBranch
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
            const isSelected = branch.name === selectedBranchName;
            const itemClassName =
              isSelected && isActive
                ? styles.branchItemSelectedActive
                : isSelected
                  ? styles.branchItemSelected
                  : isActive
                    ? styles.branchItemActive
                    : styles.branchItem;
            const nameClassName =
              isSelected && isActive
                ? styles.branchNameSelectedActive
                : isSelected
                  ? styles.branchNameSelected
                  : isActive
                    ? styles.branchNameActive
                    : styles.branchName;

            return (
              <button
                key={branch.fullRef}
                className={itemClassName}
                onClick={() => onSelectBranch(branch)}
                type="button"
              >
                <span className={nameClassName}>{branch.name}</span>
              </button>
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
