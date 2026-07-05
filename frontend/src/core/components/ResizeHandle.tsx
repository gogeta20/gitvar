import styles from "./ResizeHandle.module.css";

interface ResizeHandleProps {
  label: string;
  onPointerDown: (event: { clientX: number }) => void;
  className?: string;
}

export function ResizeHandle({ label, onPointerDown, className }: ResizeHandleProps) {
  return (
    <div
      aria-label={label}
      className={className ? `${styles.handle} ${className}` : styles.handle}
      onPointerDown={onPointerDown}
      role="separator"
    >
      <span className={styles.grip} />
    </div>
  );
}
