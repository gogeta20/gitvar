import { useEffect, useMemo, useState } from "react";
import { Cloud, ListFilter } from "lucide-react";
import { InfoCard } from "@core/components/InfoCard";
import { usePersistedState } from "@core/hooks/usePersistedState";
import { readBranches } from "@modules/branches/application/use-cases/readBranches";
import { Branch } from "@modules/branches/domain/branch";
import { createBranchReader } from "@modules/branches/infrastructure/BranchReaderProvider";
import styles from "./BranchesPanel.module.css";

interface BranchesPanelProps {
  repositoryPath: string;
  selectedBranchName: string | null;
  onSelectBranch: (branch: Branch) => void;
  embedded?: boolean;
}

type BranchOrderMode = "alphabetical" | "created-desc" | "created-asc";

export function BranchesPanel({
  repositoryPath,
  selectedBranchName,
  onSelectBranch,
  embedded = false
}: BranchesPanelProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [orderMode, setOrderMode] = usePersistedState<BranchOrderMode>(
    "gitmap.branches.orderMode",
    "alphabetical"
  );

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
      if (left.isRemote !== right.isRemote) {
        return left.isRemote ? 1 : -1;
      }

      if (
        (orderMode === "created-desc" || orderMode === "created-asc") &&
        !left.isRemote &&
        !right.isRemote
      ) {
        const leftTimestamp = left.createdAt ? Date.parse(left.createdAt) : 0;
        const rightTimestamp = right.createdAt ? Date.parse(right.createdAt) : 0;

        if (leftTimestamp !== rightTimestamp) {
          return orderMode === "created-desc"
            ? rightTimestamp - leftTimestamp
            : leftTimestamp - rightTimestamp;
        }
      }

      return left.name.localeCompare(right.name);
    });
  }, [branches, orderMode]);

  const content = (
    <>
      <div className={styles.branchToolbar}>
        <span className={styles.branchToolbarLabel}>
          <ListFilter size={12} />
          Order
        </span>
        <div className={styles.branchToolbarActions}>
          <button
            className={
              orderMode === "alphabetical"
                ? styles.branchOrderButtonActive
                : styles.branchOrderButton
            }
            onClick={() => setOrderMode("alphabetical")}
            type="button"
          >
            A-Z
          </button>
          <button
            className={
              orderMode === "created-desc"
                ? styles.branchOrderButtonActive
                : styles.branchOrderButton
            }
            onClick={() => setOrderMode("created-desc")}
            type="button"
          >
            Newest
          </button>
          <button
            className={
              orderMode === "created-asc"
                ? styles.branchOrderButtonActive
                : styles.branchOrderButton
            }
            onClick={() => setOrderMode("created-asc")}
            type="button"
          >
            Oldest
          </button>
        </div>
      </div>

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
                <span className={styles.branchRowContent}>
                  {branch.isRemote ? (
                    <Cloud className={styles.branchRemoteIcon} size={12} />
                  ) : null}
                  <span className={nameClassName}>{branch.name}</span>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      {!error && branches.length === 0 ? (
        <p className={styles.empty}>No branches returned by backend.</p>
      ) : null}
    </>
  );

  if (embedded) {
    return content;
  }

  return <InfoCard title="Branches">{content}</InfoCard>;
}
