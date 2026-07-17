import { useEffect, useState } from "react";

function readThemeId(): string {
  return document.documentElement.getAttribute("data-theme") ?? "dracula";
}

export function useAppThemeId(): string {
  const [themeId, setThemeId] = useState(readThemeId);

  useEffect(() => {
    const observer = new MutationObserver(() => setThemeId(readThemeId()));

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"]
    });

    return () => observer.disconnect();
  }, []);

  return themeId;
}
