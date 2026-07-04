import { useEffect, useState } from "react";
import { ShellLayout } from "@core/layouts/ShellLayout";
import { HomePage } from "@pages/HomePage";
import { RepositoryWorkspacePage } from "@pages/RepositoryWorkspacePage";

export function App() {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dracula");
  }, []);

  const [selectedRepositoryId, setSelectedRepositoryId] = useState<string | null>(
    null
  );

  if (selectedRepositoryId) {
    return (
      <ShellLayout title="Repository workspace">
        <RepositoryWorkspacePage
          selectedRepositoryId={selectedRepositoryId}
          onBack={() => setSelectedRepositoryId(null)}
        />
      </ShellLayout>
    );
  }

  return (
    <ShellLayout title="Choose a repository">
      <HomePage onOpenRepository={setSelectedRepositoryId} />
    </ShellLayout>
  );
}
