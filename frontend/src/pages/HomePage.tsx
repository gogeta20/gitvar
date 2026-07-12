import { RepositorySummary } from "@modules/repository/domain/repository";
import { RepositoryPicker } from "@modules/repository/ui/RepositoryPicker";

interface HomePageProps {
  recentRepositories: RepositorySummary[];
  onOpenRepository: (repository: RepositorySummary) => void;
}

export function HomePage({ recentRepositories, onOpenRepository }: HomePageProps) {
  return (
    <RepositoryPicker onOpenRepository={onOpenRepository} recentRepositories={recentRepositories} />
  );
}
