import { PropsWithChildren, ReactNode } from "react";
import styles from "./ShellLayout.module.css";

interface ShellLayoutProps extends PropsWithChildren {
  eyebrow?: string;
  headerActions?: ReactNode;
}

export function ShellLayout({
  children,
  eyebrow = "GitMap",
  headerActions
}: ShellLayoutProps) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <div className={styles.headerActions}>{headerActions}</div>
      </header>
      <main className={styles.content}>{children}</main>
    </div>
  );
}
