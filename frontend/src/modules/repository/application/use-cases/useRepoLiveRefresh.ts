import { useEffect, useRef, useState } from "react";
import { readRepoSignature } from "@modules/repository/application/use-cases/readRepoSignature";
import { createRepoSignatureReader } from "@modules/repository/infrastructure/RepoSignatureReaderProvider";

const POLL_INTERVAL_MS = 2000;

export function useRepoLiveRefresh(repositoryPath: string): number {
  const [refreshToken, setRefreshToken] = useState(0);
  const lastSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    lastSignatureRef.current = null;

    const repoSignatureReader = createRepoSignatureReader();
    let isCancelled = false;

    const intervalId = window.setInterval(() => {
      readRepoSignature(repoSignatureReader, repositoryPath)
        .then((signature) => {
          if (isCancelled) {
            return;
          }

          if (lastSignatureRef.current !== null && lastSignatureRef.current !== signature) {
            setRefreshToken((current) => current + 1);
          }

          lastSignatureRef.current = signature;
        })
        .catch(() => {
          // Transient polling failure; the next tick will retry.
        });
    }, POLL_INTERVAL_MS);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, [repositoryPath]);

  return refreshToken;
}
