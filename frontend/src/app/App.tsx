import { useEffect, useState } from "react";
import { ShellLayout } from "@core/layouts/ShellLayout";
import { HomePage } from "@pages/HomePage";
import { RepositoryWorkspacePage } from "@pages/RepositoryWorkspacePage";
import { WorkspaceTabsBar } from "@modules/repository/ui/WorkspaceTabsBar";

export function App() {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dracula");
  }, []);

  const [openRepositoryIds, setOpenRepositoryIds] = useState<string[]>([]);
  const [activeRepositoryId, setActiveRepositoryId] = useState<string | null>(null);

  function handleOpenRepository(repositoryId: string) {
    setOpenRepositoryIds((current) =>
      current.includes(repositoryId) ? current : [...current, repositoryId]
    );
    setActiveRepositoryId(repositoryId);
  }

  function handleCloseTab(repositoryId: string) {
    setOpenRepositoryIds((current) => current.filter((id) => id !== repositoryId));
    setActiveRepositoryId((current) => (current === repositoryId ? null : current));
  }

  return (
    <ShellLayout title={activeRepositoryId ? "Repository workspace" : "Choose a repository"}>
      <WorkspaceTabsBar
        activeRepositoryId={activeRepositoryId}
        onAddTab={() => setActiveRepositoryId(null)}
        onCloseTab={handleCloseTab}
        onSelectTab={setActiveRepositoryId}
        openRepositoryIds={openRepositoryIds}
      />

      {activeRepositoryId ? (
        <RepositoryWorkspacePage selectedRepositoryId={activeRepositoryId} />
      ) : (
        <HomePage onOpenRepository={handleOpenRepository} />
      )}
    </ShellLayout>
  );
}
