import { useEffect, useState } from "react";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  FolderTree,
  List,
  Pencil,
  Plus,
  Sparkles,
  Trash2
} from "lucide-react";
import { InfoCard } from "@core/components/InfoCard";
import { readCommitFiles } from "@modules/graph/application/use-cases/readCommitFiles";
import { readStatus } from "@modules/graph/application/use-cases/readStatus";
import { GraphCommit } from "@modules/graph/domain/commit";
import { FileChange } from "@modules/graph/domain/fileChange";
import { WorkingStatus } from "@modules/graph/domain/workingStatus";
import { createCommitFilesReader } from "@modules/graph/infrastructure/CommitFilesReaderProvider";
import { createStatusReader } from "@modules/graph/infrastructure/StatusReaderProvider";
import { countByChangeType, groupFileChanges, groupPathForFile } from "@modules/graph/lib/groupFileChanges";
import styles from "./CommitDetailPanel.module.css";

interface CommitDetailPanelProps {
  commit: GraphCommit | null;
  repositoryPath: string;
  selectedFilePath: string | null;
  onSelectFile: (filePath: string) => void;
}

function formatAuthoredDate(input: string): string {
  const date = new Date(input);

  if (Number.isNaN(date.getTime())) {
    return input;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
    .format(date)
    .replace(",", " @");
}

export function CommitDetailPanel({
  commit,
  repositoryPath,
  selectedFilePath,
  onSelectFile
}: CommitDetailPanelProps) {
  const [viewMode, setViewMode] = useState<"tree" | "path">("tree");
  const [expandedPaths, setExpandedPaths] = useState<string[]>([]);
  const [showAllFiles, setShowAllFiles] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);
  const [workingStatus, setWorkingStatus] = useState<WorkingStatus | null>(null);
  const [commitFiles, setCommitFiles] = useState<FileChange[]>([]);
  const [filesError, setFilesError] = useState<string | null>(null);

  useEffect(() => {
    const statusReader = createStatusReader();

    readStatus(statusReader, repositoryPath)
      .then(setWorkingStatus)
      .catch(() => setWorkingStatus(null));
  }, [repositoryPath]);

  useEffect(() => {
    if (!commit || commit.isWorkingChanges) {
      setCommitFiles([]);
      return;
    }

    const commitFilesReader = createCommitFilesReader();

    setFilesError(null);

    readCommitFiles(commitFilesReader, repositoryPath, commit.id)
      .then(setCommitFiles)
      .catch((currentError: unknown) => {
        setCommitFiles([]);
        setFilesError(
          currentError instanceof Error ? currentError.message : "Unexpected error."
        );
      });
  }, [commit, repositoryPath]);

  useEffect(() => {
    if (!selectedFilePath) {
      return;
    }

    const groupPath = groupPathForFile(selectedFilePath);
    setExpandedPaths((current) =>
      current.includes(groupPath) ? current : [...current, groupPath]
    );
  }, [selectedFilePath]);

  function toggleExpanded(path: string) {
    setExpandedPaths((current) =>
      current.includes(path) ? current.filter((item) => item !== path) : [...current, path]
    );
  }

  if (!commit) {
    return (
      <InfoCard title="Commit detail">
        <p className={styles.emptyState}>
          Select a commit from the graph to inspect its details.
        </p>
      </InfoCard>
    );
  }

  const files = commit.isWorkingChanges ? workingStatus?.changedFiles ?? [] : commitFiles;
  const fileGroups = groupFileChanges(files);
  const modifiedCount = countByChangeType(files, ["modified", "renamed"]);
  const addedCount = countByChangeType(files, ["added", "untracked"]);
  const deletedCount = countByChangeType(files, ["deleted"]);

  const parentShortId = commit.parents[0]?.slice(0, 7) ?? "—";
  const authorInitial = commit.authorName.charAt(0).toUpperCase() || "?";

  return (
    <InfoCard>
      {workingStatus?.isDirty ? (
        <div className={styles.workingDirectoryBanner}>
          <span>{workingStatus.changedFiles.length} file changes in working directory</span>
          <button className={styles.viewChangesButton} type="button">
            View Changes
          </button>
        </div>
      ) : null}

      <button
        className={styles.summaryToggle}
        onClick={() => setIsSummaryExpanded((current) => !current)}
        type="button"
      >
        {isSummaryExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        Commit details
      </button>

      {isSummaryExpanded ? (
        <>
          <div className={styles.commitBar}>
            <span className={styles.commitBarLabel}>
              {commit.isWorkingChanges ? (
                "Working directory"
              ) : (
                <>
                  commit: <span className={styles.commitBarHash}>{commit.shortId}</span>
                </>
              )}
            </span>
            {!commit.isWorkingChanges ? (
              <button className={styles.aiButton} type="button">
                <Sparkles size={14} />
                Recompose commit with AI
                <ChevronDown size={14} />
              </button>
            ) : null}
          </div>

          <div className={styles.messageCard}>
            <h3 className={styles.messageTitle}>{commit.message}</h3>
            <p className={styles.messageBody}>
              {commit.isWorkingChanges
                ? "Changes not yet committed in the working directory."
                : "Mock description until the backend sends the full commit body, not just the subject line."}
            </p>
          </div>

          {!commit.isWorkingChanges ? (
            <div className={styles.authorRow}>
              <div className={styles.authorIdentity}>
                <span className={styles.authorAvatar} aria-hidden="true">
                  {authorInitial}
                </span>
                <div>
                  <div className={styles.authorName}>{commit.authorName}</div>
                  <div className={styles.authorDate}>
                    authored {formatAuthoredDate(commit.authoredAt)}
                  </div>
                </div>
              </div>
              <span className={styles.parentLabel}>parent: {parentShortId}</span>
            </div>
          ) : null}
        </>
      ) : null}

      <div className={styles.statsRow}>
        {modifiedCount > 0 ? (
          <span className={styles.statItem}>
            <Pencil size={13} />
            {modifiedCount} modified
          </span>
        ) : null}
        {addedCount > 0 ? (
          <span className={styles.statItem}>
            <Plus size={13} />
            {addedCount} added
          </span>
        ) : null}
        {deletedCount > 0 ? (
          <span className={styles.statItem}>
            <Trash2 size={13} />
            {deletedCount} deleted
          </span>
        ) : null}
      </div>

      <div className={styles.fileToolbar}>
        <button aria-label="Sort files" className={styles.toolbarIconButton} type="button">
          <ArrowUpDown size={14} />
        </button>

        <div className={styles.viewModeToggle}>
          <button
            className={viewMode === "path" ? styles.viewModeButtonActive : styles.viewModeButton}
            onClick={() => setViewMode("path")}
            type="button"
          >
            <List size={13} />
            Path
          </button>
          <button
            className={viewMode === "tree" ? styles.viewModeButtonActive : styles.viewModeButton}
            onClick={() => setViewMode("tree")}
            type="button"
          >
            <FolderTree size={13} />
            Tree
          </button>
        </div>

        <label className={styles.viewAllFiles}>
          <input
            checked={showAllFiles}
            onChange={() => setShowAllFiles((current) => !current)}
            type="checkbox"
          />
          View all files
        </label>
      </div>

      <button
        className={styles.expandAllButton}
        onClick={() =>
          setExpandedPaths((current) =>
            current.length === fileGroups.length ? [] : fileGroups.map((group) => group.path)
          )
        }
        type="button"
      >
        Expand All
      </button>

      {filesError ? <p className={styles.emptyState}>{filesError}</p> : null}

      <div className={styles.fileTreeScroll}>
        {fileGroups.map((group) => {
          const isExpanded = expandedPaths.includes(group.path);
          const groupModifiedCount = countByChangeType(group.files, ["modified", "renamed"]);
          const groupAddedCount = countByChangeType(group.files, ["added", "untracked"]);
          const groupDeletedCount = countByChangeType(group.files, ["deleted"]);

          return (
            <div className={styles.fileGroup} key={group.path}>
              <button
                className={styles.fileGroupHeader}
                onClick={() => toggleExpanded(group.path)}
                type="button"
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span className={styles.fileGroupPath}>{group.path}</span>
                {groupModifiedCount > 0 ? (
                  <span className={styles.fileGroupStat}>
                    <Pencil size={12} />
                    {groupModifiedCount}
                  </span>
                ) : null}
                {groupAddedCount > 0 ? (
                  <span className={styles.fileGroupStatAdded}>
                    <Plus size={12} />
                    {groupAddedCount}
                  </span>
                ) : null}
                {groupDeletedCount > 0 ? (
                  <span className={styles.fileGroupStat}>
                    <Trash2 size={12} />
                    {groupDeletedCount}
                  </span>
                ) : null}
              </button>

              {isExpanded ? (
                <ul className={styles.fileList}>
                  {group.files.map((file) => (
                    <li key={file.path}>
                      <button
                        className={
                          file.path === selectedFilePath
                            ? styles.fileListItemActive
                            : styles.fileListItem
                        }
                        onClick={() => onSelectFile(file.path)}
                        type="button"
                      >
                        {file.path}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          );
        })}
      </div>
    </InfoCard>
  );
}
