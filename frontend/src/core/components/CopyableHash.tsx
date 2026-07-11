import { useState } from "react";
import { Check, Copy } from "lucide-react";
import styles from "./CopyableHash.module.css";

interface CopyableHashProps {
  fullHash: string;
  displayHash?: string;
  className?: string;
}

export function CopyableHash({ fullHash, displayHash, className }: CopyableHashProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(fullHash).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  }

  return (
    <button
      className={className ? `${styles.button} ${className}` : styles.button}
      onClick={handleCopy}
      title={fullHash}
      type="button"
    >
      {displayHash ?? fullHash.slice(0, 7)}
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  );
}
