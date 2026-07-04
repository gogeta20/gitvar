import { PropsWithChildren } from "react";
import styles from "./ShellLayout.module.css";

interface ShellLayoutProps extends PropsWithChildren {
  title: string;
  eyebrow?: string;
}

export function ShellLayout({
  children,
  title,
  eyebrow = "GitMap"
}: ShellLayoutProps) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 className={styles.title}>{title}</h1>
        </div>
      </header>
      <main className={styles.content}>{children}</main>
    </div>
  );
}
