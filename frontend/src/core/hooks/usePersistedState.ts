import { Dispatch, SetStateAction, useEffect, useState } from "react";

function readStoredValue<T>(storageKey: string, defaultValue: T): T {
  const raw = window.localStorage.getItem(storageKey);

  if (raw === null) {
    return defaultValue;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

export function usePersistedState<T>(
  storageKey: string,
  defaultValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => readStoredValue(storageKey, defaultValue));

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(value));
  }, [storageKey, value]);

  return [value, setValue];
}
