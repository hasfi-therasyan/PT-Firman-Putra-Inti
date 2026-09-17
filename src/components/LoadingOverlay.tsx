'use client';

import { ReactNode } from 'react';
import styles from './LoadingOverlay.module.css';

export default function LoadingOverlay({ isLoading, children }: { isLoading: boolean; children: ReactNode }) {
  return (
    <>
      {children}
      {isLoading && (
        <div className={styles.overlay} role="status" aria-live="polite" aria-busy="true">
          <div className={styles.loader}>
            <span className={styles.bubble}></span>
            <span className={styles.bubble}></span>
            <span className={styles.bubble}></span>
            <span className={styles.bubble}></span>
            <span className={styles.bubble}></span>
          </div>
          <p className={styles.text}>Memuat…</p>
        </div>
      )}
    </>
  );
}