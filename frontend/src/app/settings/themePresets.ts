export interface ThemePreset {
  id: string;
  label: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  { id: "dracula", label: "Dracula" },
  { id: "vscode-dark", label: "VS Code Dark+" },
  { id: "tokyo-night", label: "Tokyo Night" }
];

export const DEFAULT_THEME_ID = THEME_PRESETS[0].id;
