import { getSingletonHighlighter, type BundledLanguage, type BundledTheme, type ThemedToken } from "shiki";
import { DiffHunk } from "@modules/graph/domain/diffHunk";

const EXTENSION_TO_SHIKI_LANG: Record<string, BundledLanguage> = {
  ts: "typescript",
  tsx: "tsx",
  js: "javascript",
  jsx: "jsx",
  mjs: "javascript",
  rs: "rust",
  css: "css",
  json: "json",
  md: "markdown",
  html: "html",
  yml: "yaml",
  yaml: "yaml",
  toml: "toml",
  sql: "sql",
  py: "python",
  go: "go",
  sh: "shellscript",
  rb: "ruby"
};

const APP_THEME_TO_SHIKI_THEME: Record<string, BundledTheme> = {
  dracula: "dracula",
  "vscode-dark": "dark-plus",
  "tokyo-night": "tokyo-night"
};

const DEFAULT_SHIKI_THEME: BundledTheme = "dark-plus";

export function shikiThemeForAppTheme(appThemeId: string): BundledTheme {
  return APP_THEME_TO_SHIKI_THEME[appThemeId] ?? DEFAULT_SHIKI_THEME;
}

export function shikiLangForFilePath(filePath: string): BundledLanguage | "text" {
  const extension = filePath.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_TO_SHIKI_LANG[extension] ?? "text";
}

export async function highlightHunkLines(
  hunk: DiffHunk,
  filePath: string,
  appThemeId: string
): Promise<ThemedToken[][]> {
  const lang = shikiLangForFilePath(filePath);
  const theme = shikiThemeForAppTheme(appThemeId);

  if (lang === "text") {
    return hunk.lines.map((line) => [{ content: line.content } as ThemedToken]);
  }

  const highlighter = await getSingletonHighlighter({
    themes: [theme],
    langs: [lang]
  });

  const code = hunk.lines.map((line) => line.content).join("\n");

  return highlighter.codeToTokensBase(code, { lang, theme });
}
