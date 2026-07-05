import { useEffect, useRef, useState } from "react";
import { Columns3 } from "lucide-react";
import { IconButton } from "@core/components/IconButton";
import styles from "./HistoryMapOptionsMenu.module.css";

interface HistoryMapOptionsMenuProps {
  showAuthor: boolean;
  showDate: boolean;
  showMessage: boolean;
  onToggleAuthor: () => void;
  onToggleDate: () => void;
  onToggleMessage: () => void;
}

export function HistoryMapOptionsMenu({
  showAuthor,
  showDate,
  showMessage,
  onToggleAuthor,
  onToggleDate,
  onToggleMessage
}: HistoryMapOptionsMenuProps) {
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

  return (
    <div className={styles.container} ref={containerRef}>
      <IconButton
        icon={<Columns3 size={16} />}
        label="Choose visible columns"
        onClick={() => setIsOpen((current) => !current)}
      />

      {isOpen ? (
        <div className={styles.menu} role="menu">
          <label className={styles.option}>
            <input checked={showAuthor} onChange={onToggleAuthor} type="checkbox" />
            Author
          </label>
          <label className={styles.option}>
            <input checked={showDate} onChange={onToggleDate} type="checkbox" />
            Date
          </label>
          <label className={styles.option}>
            <input checked={showMessage} onChange={onToggleMessage} type="checkbox" />
            Message
          </label>
        </div>
      ) : null}
    </div>
  );
}
