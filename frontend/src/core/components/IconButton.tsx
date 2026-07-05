import { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./IconButton.module.css";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
}

export function IconButton({ icon, label, className, ...buttonProps }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={className ? `${styles.button} ${className}` : styles.button}
      title={label}
      type="button"
      {...buttonProps}
    >
      {icon}
    </button>
  );
}
