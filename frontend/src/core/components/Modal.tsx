import { MouseEvent, PropsWithChildren, useEffect } from "react";
import { X } from "lucide-react";
import { IconButton } from "@core/components/IconButton";
import styles from "./Modal.module.css";

interface ModalProps extends PropsWithChildren {
  title: string;
  onClose: () => void;
}

export function Modal({ title, onClose, children }: ModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleOverlayMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <div className={styles.overlay} onMouseDown={handleOverlayMouseDown}>
      <div aria-modal="true" className={styles.panel} role="dialog">
        <div className={styles.header}>
          <strong className={styles.title}>{title}</strong>
          <IconButton icon={<X size={16} />} label="Close" onClick={onClose} />
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
