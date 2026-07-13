import { useEffect, useRef, useState } from "react";
import { Settings } from "lucide-react";
import { IconButton } from "@core/components/IconButton";
import styles from "./SettingsMenu.module.css";

interface SettingsMenuProps {
  onOpenStyleSettings: () => void;
}

export function SettingsMenu({ onOpenStyleSettings }: SettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  function handleOpenStyleSettings() {
    setIsOpen(false);
    onOpenStyleSettings();
  }

  return (
    <div className={styles.container} ref={containerRef}>
      <IconButton
        icon={<Settings size={16} />}
        label="Settings"
        onClick={() => setIsOpen((current) => !current)}
      />

      {isOpen ? (
        <div className={styles.menu} role="menu">
          <button className={styles.menuItem} onClick={handleOpenStyleSettings} type="button">
            Style
          </button>
        </div>
      ) : null}
    </div>
  );
}
