import { RepositoryPicker } from "@modules/repository/ui/RepositoryPicker";

interface HomePageProps {
  onOpenRepository: (repositoryId: string) => void;
}

export function HomePage({ onOpenRepository }: HomePageProps) {
  return <RepositoryPicker onOpenRepository={onOpenRepository} />;
}
