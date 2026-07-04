import { useEffect, useState } from "react";
import { InfoCard } from "@core/components/InfoCard";
import { User } from "@modules/user/domain/user";
import { createUserReader } from "@modules/user/infrastructure/UserReaderProvider";
import { getCurrentUser } from "@modules/user/application/use-cases/getCurrentUser";

export function CurrentUserCard() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userReader = createUserReader();

    getCurrentUser(userReader)
      .then(setUser)
      .catch((currentError: unknown) => {
        setError(
          currentError instanceof Error
            ? currentError.message
            : "Unexpected error."
        );
      });
  }, []);

  return (
    <InfoCard title="Current user use case">
      {error ? <p>{error}</p> : null}
      {!error && !user ? <p>Loading...</p> : null}
      {user ? (
        <div>
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
        </div>
      ) : null}
    </InfoCard>
  );
}

