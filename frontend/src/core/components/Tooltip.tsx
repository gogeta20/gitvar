import { PropsWithChildren, ReactNode } from "react";
import styles from "./Tooltip.module.css";

interface TooltipProps extends PropsWithChildren {
  items: ReactNode[];
}

export function Tooltip({ items, children }: TooltipProps) {
  if (items.length === 0) {
    return <>{children}</>;
  }

  return (
    <span className={styles.wrapper}>
      {children}
      <span className={styles.panel} role="tooltip">
        <ul className={styles.list}>
          {items.map((item, index) => (
            <li key={index} className={styles.item}>
              {item}
            </li>
          ))}
        </ul>
      </span>
    </span>
  );
}
