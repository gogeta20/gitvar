import { PropsWithChildren } from "react";
import styles from "./InfoCard.module.css";

interface InfoCardProps extends PropsWithChildren {
  title: string;
}

export function InfoCard({ title, children }: InfoCardProps) {
  return (
    <section className={styles.card}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.body}>{children}</div>
    </section>
  );
}
