export interface ThemePreset {
  id: string;
  label: string;
}

export const THEME_PRESETS: ThemePreset[] = [{ id: "dracula", label: "Dracula" }];

export const DEFAULT_THEME_ID = THEME_PRESETS[0].id;
