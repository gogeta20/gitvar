import { RepositorySummary } from "@modules/repository/domain/repository";
import { RepositoryPicker } from "@modules/repository/ui/RepositoryPicker";

interface HomePageProps {
  onOpenRepository: (repository: RepositorySummary) => void;
}

export function HomePage({ onOpenRepository }: HomePageProps) {
  return <RepositoryPicker onOpenRepository={onOpenRepository} />;
}
