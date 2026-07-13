import { Check } from "lucide-react";
import { Modal } from "@core/components/Modal";
import { THEME_PRESETS } from "@app/settings/themePresets";
import styles from "./ThemeSettingsModal.module.css";

interface ThemeSettingsModalProps {
  activeThemeId: string;
  onClose: () => void;
  onSelectTheme: (themeId: string) => void;
}

export function ThemeSettingsModal({ activeThemeId, onClose, onSelectTheme }: ThemeSettingsModalProps) {
  return (
    <Modal onClose={onClose} title="Style">
      <div className={styles.presetList}>
        {THEME_PRESETS.map((preset) => {
          const isActive = preset.id === activeThemeId;

          return (
            <button
              className={isActive ? styles.presetActive : styles.preset}
              key={preset.id}
              onClick={() => onSelectTheme(preset.id)}
              type="button"
            >
              {preset.label}
              {isActive ? <Check size={14} /> : null}
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
