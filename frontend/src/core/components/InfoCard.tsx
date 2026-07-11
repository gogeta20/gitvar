import { PropsWithChildren, ReactNode } from "react";
import styles from "./InfoCard.module.css";

interface InfoCardProps extends PropsWithChildren {
  title?: string;
  headerActions?: ReactNode;
  /** Stretches the card to fill its container's height and scrolls the body instead of the page. */
  fillHeight?: boolean;
  /** Rendered between the header and the (possibly scrolling) body; never clipped by body overflow. */
  banner?: ReactNode;
}

export function InfoCard({ title, headerActions, children, fillHeight, banner }: InfoCardProps) {
  return (
    <section className={fillHeight ? `${styles.card} ${styles.cardFill}` : styles.card}>
      {title || headerActions ? (
        <div className={styles.header}>
          {title ? <h2 className={styles.title}>{title}</h2> : <span />}
          {headerActions ? <div className={styles.headerActions}>{headerActions}</div> : null}
        </div>
      ) : null}
      {banner}
      <div className={fillHeight ? `${styles.body} ${styles.bodyFill}` : styles.body}>
        {children}
      </div>
    </section>
  );
}
