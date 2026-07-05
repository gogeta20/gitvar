import { useState } from "react";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  FolderTree,
  List,
  Pencil,
  Plus,
  Sparkles
} from "lucide-react";
import { InfoCard } from "@core/components/InfoCard";
import { GraphCommit } from "@modules/graph/domain/commit";
import styles from "./CommitDetailPanel.module.css";

interface CommitDetailPanelProps {
  commit: GraphCommit | null;
}

interface MockFileGroup {
  path: string;
  modifiedCount: number;
  addedCount: number;
  files: string[];
}

const MOCK_WORKING_DIRECTORY_CHANGE_COUNT = 13;

const MOCK_FILE_GROUPS: MockFileGroup[] = [
  {
    path: "docs",
    modifiedCount: 1,
    addedCount: 2,
    files: ["plan.md", "sesiones/2026-07-05-commit-detail-mock.md", "sesiones/2026-07-05-notas.md"]
  },
  {
    path: "frontend",
    modifiedCount: 4,
    addedCount: 0,
    files: [
      "src/modules/graph/ui/CommitGraphPanel.module.css",
      "src/modules/graph/ui/CommitGraphRow.tsx",
      "src/modules/repository/ui/RepositoryWorkspace.tsx",
      "src/modules/repository/ui/RepositoryWorkspace.module.css"
    ]
  }
];

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

export function CommitDetailPanel({ commit }: CommitDetailPanelProps) {
  const [viewMode, setViewMode] = useState<"tree" | "path">("tree");
  const [expandedPaths, setExpandedPaths] = useState<string[]>([]);
  const [showAllFiles, setShowAllFiles] = useState(false);

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

  const parentShortId = commit.parents[0]?.slice(0, 7) ?? "—";
  const authorInitial = commit.authorName.charAt(0).toUpperCase() || "?";

  return (
    <InfoCard>
      <div className={styles.workingDirectoryBanner}>
        <span>{MOCK_WORKING_DIRECTORY_CHANGE_COUNT} file changes in working directory</span>
        <button className={styles.viewChangesButton} type="button">
          View Changes
        </button>
      </div>

      <div className={styles.commitBar}>
        <span className={styles.commitBarLabel}>
          commit: <span className={styles.commitBarHash}>{commit.shortId}</span>
        </span>
        <button className={styles.aiButton} type="button">
          <Sparkles size={14} />
          Recompose commit with AI
          <ChevronDown size={14} />
        </button>
      </div>

      <div className={styles.messageCard}>
        <h3 className={styles.messageTitle}>{commit.message}</h3>
        <p className={styles.messageBody}>
          Mock description until the backend sends the full commit body, not just the
          subject line.
        </p>
      </div>

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

      <div className={styles.statsRow}>
        <span className={styles.statItem}>
          <Pencil size={13} />
          {MOCK_FILE_GROUPS.reduce((sum, group) => sum + group.modifiedCount, 0)} modified
        </span>
        <span className={styles.statItem}>
          <Plus size={13} />
          {MOCK_FILE_GROUPS.reduce((sum, group) => sum + group.addedCount, 0)} added
        </span>
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
            current.length === MOCK_FILE_GROUPS.length
              ? []
              : MOCK_FILE_GROUPS.map((group) => group.path)
          )
        }
        type="button"
      >
        Expand All
      </button>

      <div className={styles.fileTree}>
        {MOCK_FILE_GROUPS.map((group) => {
          const isExpanded = expandedPaths.includes(group.path);

          return (
            <div className={styles.fileGroup} key={group.path}>
              <button
                className={styles.fileGroupHeader}
                onClick={() => toggleExpanded(group.path)}
                type="button"
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span className={styles.fileGroupPath}>{group.path}</span>
                {group.modifiedCount > 0 ? (
                  <span className={styles.fileGroupStat}>
                    <Pencil size={12} />
                    {group.modifiedCount}
                  </span>
                ) : null}
                {group.addedCount > 0 ? (
                  <span className={styles.fileGroupStatAdded}>
                    <Plus size={12} />
                    {group.addedCount}
                  </span>
                ) : null}
              </button>

              {isExpanded ? (
                <ul className={styles.fileList}>
                  {group.files.map((file) => (
                    <li className={styles.fileListItem} key={file}>
                      {file}
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
