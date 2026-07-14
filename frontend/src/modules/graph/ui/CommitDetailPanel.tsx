import { useCallback, useEffect, useState } from "react";
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronRight,
  FolderTree,
  List,
  Palette,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Undo2
} from "lucide-react";
import { CopyableHash } from "@core/components/CopyableHash";
import { InfoCard } from "@core/components/InfoCard";
import { Tooltip } from "@core/components/Tooltip";
import { usePersistedState } from "@core/hooks/usePersistedState";
import { discardAll } from "@modules/graph/application/use-cases/discardAll";
import { discardFile } from "@modules/graph/application/use-cases/discardFile";
import { readCommitFiles } from "@modules/graph/application/use-cases/readCommitFiles";
import { readStatus } from "@modules/graph/application/use-cases/readStatus";
import { stageAll } from "@modules/graph/application/use-cases/stageAll";
import { stageFile } from "@modules/graph/application/use-cases/stageFile";
import { unstageFile } from "@modules/graph/application/use-cases/unstageFile";
import { GraphCommit } from "@modules/graph/domain/commit";
import { FileChange } from "@modules/graph/domain/fileChange";
import { WorkingStatus } from "@modules/graph/domain/workingStatus";
import { createCommitFilesReader } from "@modules/graph/infrastructure/CommitFilesReaderProvider";
import { createStatusReader } from "@modules/graph/infrastructure/StatusReaderProvider";
import { createWorkingChangesWriter } from "@modules/graph/infrastructure/WorkingChangesWriterProvider";
import { ancestorFolderPaths, buildFileTree, collectFolderPaths } from "@modules/graph/lib/buildFileTree";
import { changeTypeLetter } from "@modules/graph/lib/changeTypeLetter";
import { countByChangeType } from "@modules/graph/lib/countByChangeType";
import {
  compareFilesBySortMode,
  FileSortMode,
  nextSortMode,
  sortModeLabel
} from "@modules/graph/lib/fileSort";
import { FileTreeView } from "@modules/graph/ui/FileTreeView";
import styles from "./CommitDetailPanel.module.css";

interface CommitDetailPanelProps {
  commit: GraphCommit | null;
  repositoryPath: string;
  selectedFilePath: string | null;
  onSelectFile: (filePath: string) => void;
  onViewChanges: () => void;
  refreshToken?: number;
}

type StatusFilterKey = "modified" | "added" | "deleted";

const STATUS_FILTER_CHANGE_TYPES: Record<StatusFilterKey, FileChange["changeType"][]> = {
  modified: ["modified", "renamed"],
  added: ["added", "untracked"],
  deleted: ["deleted"]
};

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
  onSelectFile,
  onViewChanges,
  refreshToken
}: CommitDetailPanelProps) {
  const [viewMode, setViewMode] = usePersistedState<"tree" | "path">(
    "gitmap.commitDetail.viewMode",
    "tree"
  );
  const [expandedPaths, setExpandedPaths] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilters, setStatusFilters] = useState<Set<StatusFilterKey>>(new Set());
  const [colorizeFileNames, setColorizeFileNames] = usePersistedState(
    "gitmap.commitDetail.colorizeFileNames",
    false
  );
  const [sortMode, setSortMode] = usePersistedState<FileSortMode>(
    "gitmap.commitDetail.sortMode",
    "az"
  );
  const [isSummaryExpanded, setIsSummaryExpanded] = usePersistedState(
    "gitmap.commitDetail.summaryExpanded",
    true
  );
  const [workingStatus, setWorkingStatus] = useState<WorkingStatus | null>(null);
  const [commitFiles, setCommitFiles] = useState<FileChange[]>([]);
  const [filesError, setFilesError] = useState<string | null>(null);

  const refreshWorkingStatus = useCallback(() => {
    const statusReader = createStatusReader();

    return readStatus(statusReader, repositoryPath)
      .then(setWorkingStatus)
      .catch(() => setWorkingStatus(null));
  }, [repositoryPath]);

  useEffect(() => {
    refreshWorkingStatus();
    const intervalId = window.setInterval(refreshWorkingStatus, 2000);

    return () => window.clearInterval(intervalId);
  }, [refreshWorkingStatus]);

  function handleActionError(currentError: unknown) {
    setFilesError(currentError instanceof Error ? currentError.message : "Unexpected error.");
  }

  function handleStageFile(filePath: string) {
    const workingChangesWriter = createWorkingChangesWriter();

    stageFile(workingChangesWriter, repositoryPath, filePath)
      .then(refreshWorkingStatus)
      .catch(handleActionError);
  }

  function handleUnstageFile(filePath: string) {
    const workingChangesWriter = createWorkingChangesWriter();

    unstageFile(workingChangesWriter, repositoryPath, filePath)
      .then(refreshWorkingStatus)
      .catch(handleActionError);
  }

  function handleDiscardFile(filePath: string) {
    if (!window.confirm(`Discard changes to "${filePath}"? This cannot be undone.`)) {
      return;
    }

    const workingChangesWriter = createWorkingChangesWriter();

    discardFile(workingChangesWriter, repositoryPath, filePath)
      .then(refreshWorkingStatus)
      .catch(handleActionError);
  }

  function handleStageAll() {
    const workingChangesWriter = createWorkingChangesWriter();

    stageAll(workingChangesWriter, repositoryPath)
      .then(refreshWorkingStatus)
      .catch(handleActionError);
  }

  function handleDiscardAll() {
    if (
      !window.confirm(
        "Discard all changes in the working directory? This cannot be undone."
      )
    ) {
      return;
    }

    const workingChangesWriter = createWorkingChangesWriter();

    discardAll(workingChangesWriter, repositoryPath)
      .then(refreshWorkingStatus)
      .catch(handleActionError);
  }

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
  }, [commit, repositoryPath, refreshToken]);

  useEffect(() => {
    if (!selectedFilePath) {
      return;
    }

    const ancestors = ancestorFolderPaths(selectedFilePath);
    setExpandedPaths((current) => Array.from(new Set([...current, ...ancestors])));
  }, [selectedFilePath]);

  useEffect(() => {
    setStatusFilters(new Set());
    setSearchQuery("");
  }, [commit?.id]);

  function toggleExpanded(path: string) {
    setExpandedPaths((current) =>
      current.includes(path) ? current.filter((item) => item !== path) : [...current, path]
    );
  }

  function toggleStatusFilter(key: StatusFilterKey) {
    setStatusFilters((current) => {
      const next = new Set(current);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  }

  if (!commit) {
    return (
      <InfoCard fillHeight title="Commit detail">
        <p className={styles.emptyState}>
          Select a commit from the graph to inspect its details.
        </p>
      </InfoCard>
    );
  }

  const files = commit.isWorkingChanges ? workingStatus?.changedFiles ?? [] : commitFiles;
  const modifiedCount = countByChangeType(files, ["modified", "renamed"]);
  const addedCount = countByChangeType(files, ["added", "untracked"]);
  const deletedCount = countByChangeType(files, ["deleted"]);

  const allowedChangeTypes =
    statusFilters.size > 0
      ? Array.from(statusFilters).flatMap((key) => STATUS_FILTER_CHANGE_TYPES[key])
      : null;
  const filesForList = allowedChangeTypes
    ? files.filter((file) => allowedChangeTypes.includes(file.changeType))
    : files;

  const compareFiles = compareFilesBySortMode(sortMode);
  const sortedFiles = [...filesForList].sort(compareFiles);
  const fileTree = buildFileTree(filesForList, compareFiles);
  const folderPaths = collectFolderPaths(fileTree);

  const parentShortId = commit.parents[0]?.slice(0, 7) ?? "—";
  const authorInitial = commit.authorName.charAt(0).toUpperCase() || "?";

  const trimmedQuery = searchQuery.trim().toLowerCase();
  const filteredFiles = trimmedQuery
    ? sortedFiles.filter((file) => file.path.toLowerCase().includes(trimmedQuery))
    : [];

  const showStagingActions = commit.isWorkingChanges;
  const stagedFiles = filesForList.filter((file) => file.isStaged);
  const unstagedFiles = filesForList.filter((file) => !file.isStaged);
  const stagedTree = buildFileTree(stagedFiles, compareFiles);
  const unstagedTree = buildFileTree(unstagedFiles, compareFiles);

  function renderFileRow(file: FileChange) {
    return (
      <div className={styles.fileListItemRow} key={file.path}>
        <button
          className={file.path === selectedFilePath ? styles.fileListItemActive : styles.fileListItem}
          onClick={() => onSelectFile(file.path)}
          type="button"
        >
          <span
            className={
              colorizeFileNames
                ? `${styles.fileListItemName} ${styles[`statusBadge-${file.changeType}`]}`
                : styles.fileListItemName
            }
          >
            {file.path}
          </span>
          <span className={`${styles.statusBadge} ${styles[`statusBadge-${file.changeType}`]}`}>
            {changeTypeLetter(file.changeType)}
          </span>
        </button>

        {showStagingActions ? (
          <div className={styles.fileActions}>
            {file.isStaged ? (
              <button
                aria-label="Unstage file"
                className={`${styles.fileActionButton} ${styles.fileActionButtonUnstage}`}
                onClick={() => handleUnstageFile(file.path)}
                title="Unstage"
                type="button"
              >
                <Undo2 size={12} />
              </button>
            ) : (
              <>
                <button
                  aria-label="Stage file"
                  className={`${styles.fileActionButton} ${styles.fileActionButtonStage}`}
                  onClick={() => handleStageFile(file.path)}
                  title="Stage"
                  type="button"
                >
                  <Check size={12} />
                </button>
                <button
                  aria-label="Discard changes"
                  className={`${styles.fileActionButton} ${styles.fileActionButtonDiscard}`}
                  onClick={() => handleDiscardFile(file.path)}
                  title="Discard"
                  type="button"
                >
                  <Trash2 size={12} />
                </button>
              </>
            )}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <InfoCard
      banner={
        workingStatus?.isDirty && !commit.isWorkingChanges ? (
          <div className={styles.workingDirectoryBanner}>
            <span>{workingStatus.changedFiles.length} file changes in working directory</span>
            <button className={styles.viewChangesButton} onClick={onViewChanges} type="button">
              View Changes
            </button>
          </div>
        ) : null
      }
      fillHeight
    >
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
              {commit.isWorkingChanges ? "Working directory" : "commit"}
            </span>
            {!commit.isWorkingChanges ? (
              <CopyableHash fullHash={commit.id} displayHash={commit.shortId} />
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
              <span className={styles.parentLabel}>
                parent:{" "}
                {commit.parents[0] ? (
                  <CopyableHash fullHash={commit.parents[0]} displayHash={parentShortId} />
                ) : (
                  parentShortId
                )}
              </span>
            </div>
          ) : null}
        </>
      ) : null}

      <div className={styles.statsRow}>
        {modifiedCount > 0 ? (
          <button
            aria-pressed={statusFilters.has("modified")}
            className={
              statusFilters.has("modified") ? styles.statItemActive : styles.statItem
            }
            onClick={() => toggleStatusFilter("modified")}
            type="button"
          >
            <Pencil size={13} />
            {modifiedCount} modified
          </button>
        ) : null}
        {addedCount > 0 ? (
          <button
            aria-pressed={statusFilters.has("added")}
            className={statusFilters.has("added") ? styles.statItemActive : styles.statItem}
            onClick={() => toggleStatusFilter("added")}
            type="button"
          >
            <Plus size={13} />
            {addedCount} added
          </button>
        ) : null}
        {deletedCount > 0 ? (
          <button
            aria-pressed={statusFilters.has("deleted")}
            className={
              statusFilters.has("deleted") ? styles.statItemActive : styles.statItem
            }
            onClick={() => toggleStatusFilter("deleted")}
            type="button"
          >
            <Trash2 size={13} />
            {deletedCount} deleted
          </button>
        ) : null}
        {statusFilters.size > 0 ? (
          <button
            aria-label="Clear status filters"
            className={styles.statFilterReset}
            onClick={() => setStatusFilters(new Set())}
            type="button"
          >
            <RotateCcw size={13} />
          </button>
        ) : null}
      </div>

      <div className={styles.fileToolbar}>
        <Tooltip items={[sortModeLabel(sortMode)]}>
          <button
            aria-label="Sort files"
            className={styles.toolbarIconButton}
            onClick={() => setSortMode((current) => nextSortMode(current))}
            type="button"
          >
            <ArrowUpDown size={14} />
          </button>
        </Tooltip>

        <button
          aria-label="Colorize file names by change type"
          aria-pressed={colorizeFileNames}
          className={
            colorizeFileNames ? styles.toolbarIconButtonActive : styles.toolbarIconButton
          }
          onClick={() => setColorizeFileNames((current) => !current)}
          type="button"
        >
          <Palette size={14} />
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

        <div className={styles.searchBox}>
          <Search size={14} />
          <input
            className={styles.searchInput}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Filter files..."
            type="text"
            value={searchQuery}
          />
        </div>
      </div>

      {viewMode === "tree" && !trimmedQuery ? (
        <button
          className={styles.expandAllButton}
          onClick={() =>
            setExpandedPaths((current) => (current.length === folderPaths.length ? [] : folderPaths))
          }
          type="button"
        >
          Expand All
        </button>
      ) : null}

      {filesError ? <p className={styles.emptyState}>{filesError}</p> : null}

      {trimmedQuery && filteredFiles.length === 0 ? (
        <p className={styles.emptyState}>No files match &quot;{searchQuery}&quot;.</p>
      ) : null}

      <div className={styles.fileTreeScroll}>
        {trimmedQuery ? (
          filteredFiles.map(renderFileRow)
        ) : showStagingActions ? (
          <>
            {stagedFiles.length > 0 || unstagedFiles.length > 0 ? (
              <div className={styles.bulkActionsRow}>
                <button
                  className={styles.bulkActionButton}
                  disabled={unstagedFiles.length === 0}
                  onClick={handleStageAll}
                  type="button"
                >
                  <Check size={13} />
                  Stage all
                </button>
                <button
                  className={`${styles.bulkActionButton} ${styles.bulkActionButtonDiscard}`}
                  onClick={handleDiscardAll}
                  type="button"
                >
                  <Trash2 size={13} />
                  Discard all
                </button>
              </div>
            ) : null}

            <div className={styles.unstagedSection}>
              <div className={styles.fileSectionHeader}>Changes ({unstagedFiles.length})</div>
              {unstagedFiles.length === 0 ? (
                <p className={styles.fileSectionEmpty}>No unstaged changes.</p>
              ) : viewMode === "tree" ? (
                <FileTreeView
                  colorizeFileNames={colorizeFileNames}
                  depth={0}
                  entries={unstagedTree}
                  expandedPaths={expandedPaths}
                  onDiscardFile={handleDiscardFile}
                  onSelectFile={onSelectFile}
                  onStageFile={handleStageFile}
                  onToggleFolder={toggleExpanded}
                  selectedFilePath={selectedFilePath}
                />
              ) : (
                unstagedFiles.sort(compareFiles).map(renderFileRow)
              )}
            </div>

            <div className={styles.sectionDivider} />

            <div className={styles.stagedSection}>
              <div className={styles.fileSectionHeader}>Staged changes ({stagedFiles.length})</div>
              {stagedFiles.length === 0 ? (
                <p className={styles.fileSectionEmpty}>Nothing staged yet.</p>
              ) : viewMode === "tree" ? (
                <FileTreeView
                  colorizeFileNames={colorizeFileNames}
                  depth={0}
                  entries={stagedTree}
                  expandedPaths={expandedPaths}
                  onSelectFile={onSelectFile}
                  onToggleFolder={toggleExpanded}
                  onUnstageFile={handleUnstageFile}
                  selectedFilePath={selectedFilePath}
                />
              ) : (
                stagedFiles.sort(compareFiles).map(renderFileRow)
              )}
            </div>
          </>
        ) : viewMode === "tree" ? (
          <FileTreeView
            colorizeFileNames={colorizeFileNames}
            depth={0}
            entries={fileTree}
            expandedPaths={expandedPaths}
            onSelectFile={onSelectFile}
            onToggleFolder={toggleExpanded}
            selectedFilePath={selectedFilePath}
          />
        ) : (
          sortedFiles.map(renderFileRow)
        )}
      </div>
    </InfoCard>
  );
}
