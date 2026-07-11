import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { collectFilesInEntry } from "@modules/graph/lib/buildFileTree";
import { changeTypeLetter } from "@modules/graph/lib/changeTypeLetter";
import { countByChangeType } from "@modules/graph/lib/countByChangeType";
import { FileTreeEntry } from "@modules/graph/domain/fileTreeEntry";
import styles from "./CommitDetailPanel.module.css";

interface FileTreeViewProps {
  entries: FileTreeEntry[];
  depth: number;
  expandedPaths: string[];
  selectedFilePath: string | null;
  colorizeFileNames: boolean;
  onToggleFolder: (path: string) => void;
  onSelectFile: (path: string) => void;
}

export function FileTreeView({
  entries,
  depth,
  expandedPaths,
  selectedFilePath,
  colorizeFileNames,
  onToggleFolder,
  onSelectFile
}: FileTreeViewProps) {
  return (
    <>
      {entries.map((entry) => {
        const indent = { paddingLeft: depth * 14 };

        if (entry.type === "file") {
          return (
            <div key={entry.path} style={indent}>
              <button
                className={
                  entry.path === selectedFilePath ? styles.fileListItemActive : styles.fileListItem
                }
                onClick={() => onSelectFile(entry.path)}
                type="button"
              >
                <span
                  className={
                    colorizeFileNames
                      ? `${styles.fileListItemName} ${styles[`statusBadge-${entry.file.changeType}`]}`
                      : styles.fileListItemName
                  }
                >
                  {entry.name}
                </span>
                <span className={`${styles.statusBadge} ${styles[`statusBadge-${entry.file.changeType}`]}`}>
                  {changeTypeLetter(entry.file.changeType)}
                </span>
              </button>
            </div>
          );
        }

        const isExpanded = expandedPaths.includes(entry.path);
        const folderFiles = collectFilesInEntry(entry);
        const modifiedCount = countByChangeType(folderFiles, ["modified", "renamed"]);
        const addedCount = countByChangeType(folderFiles, ["added", "untracked"]);
        const deletedCount = countByChangeType(folderFiles, ["deleted"]);

        return (
          <div key={entry.path}>
            <button
              className={styles.fileGroupHeader}
              onClick={() => onToggleFolder(entry.path)}
              style={indent}
              type="button"
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <span className={styles.fileGroupPath}>{entry.name}</span>
              {modifiedCount > 0 ? (
                <span className={styles.fileGroupStat}>
                  <Pencil size={12} />
                  {modifiedCount}
                </span>
              ) : null}
              {addedCount > 0 ? (
                <span className={styles.fileGroupStatAdded}>
                  <Plus size={12} />
                  {addedCount}
                </span>
              ) : null}
              {deletedCount > 0 ? (
                <span className={styles.fileGroupStat}>
                  <Trash2 size={12} />
                  {deletedCount}
                </span>
              ) : null}
            </button>

            {isExpanded ? (
              <FileTreeView
                colorizeFileNames={colorizeFileNames}
                depth={depth + 1}
                entries={entry.children}
                expandedPaths={expandedPaths}
                onSelectFile={onSelectFile}
                onToggleFolder={onToggleFolder}
                selectedFilePath={selectedFilePath}
              />
            ) : null}
          </div>
        );
      })}
    </>
  );
}
