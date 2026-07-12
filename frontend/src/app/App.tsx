import { useEffect, useState } from "react";
import { ShellLayout } from "@core/layouts/ShellLayout";
import { HomePage } from "@pages/HomePage";
import { RepositoryWorkspacePage } from "@pages/RepositoryWorkspacePage";
import { RepositorySummary } from "@modules/repository/domain/repository";
import { WorkspaceTabsBar } from "@modules/repository/ui/WorkspaceTabsBar";

export function App() {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dracula");
  }, []);

  const [openRepositories, setOpenRepositories] = useState<RepositorySummary[]>([]);
  const [activeRepositoryId, setActiveRepositoryId] = useState<string | null>(null);

  function handleOpenRepository(repository: RepositorySummary) {
    setOpenRepositories((current) =>
      current.some((item) => item.id === repository.id) ? current : [...current, repository]
    );
    setActiveRepositoryId(repository.id);
  }

  function handleCloseTab(repositoryId: string) {
    setOpenRepositories((current) => current.filter((item) => item.id !== repositoryId));
    setActiveRepositoryId((current) => (current === repositoryId ? null : current));
  }

  const activeRepository = openRepositories.find((item) => item.id === activeRepositoryId) ?? null;

  return (
    <ShellLayout title={activeRepository ? "Repository workspace" : "Choose a repository"}>
      <WorkspaceTabsBar
        activeRepositoryId={activeRepositoryId}
        onAddTab={() => setActiveRepositoryId(null)}
        onCloseTab={handleCloseTab}
        onSelectTab={setActiveRepositoryId}
        openRepositories={openRepositories}
      />

      {activeRepository ? (
        <RepositoryWorkspacePage repository={activeRepository} />
      ) : (
        <HomePage onOpenRepository={handleOpenRepository} />
      )}
    </ShellLayout>
  );
}
