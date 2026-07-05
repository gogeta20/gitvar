import { PropsWithChildren, ReactNode } from "react";
import styles from "./InfoCard.module.css";

interface InfoCardProps extends PropsWithChildren {
  title?: string;
  headerActions?: ReactNode;
}

export function InfoCard({ title, headerActions, children }: InfoCardProps) {
  return (
    <section className={styles.card}>
      {title || headerActions ? (
        <div className={styles.header}>
          {title ? <h2 className={styles.title}>{title}</h2> : <span />}
          {headerActions ? <div className={styles.headerActions}>{headerActions}</div> : null}
        </div>
      ) : null}
      <div className={styles.body}>{children}</div>
    </section>
  );
}
