'use client';

import { useEffect } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    console.log('Modal rendered:', { isOpen, title });
  }, [isOpen, title]);

  if (!isOpen) {
    console.log('Modal not rendered: isOpen is false');
    return null;
  }

  console.log('Modal rendering with content');

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
        </div>
        <div className={styles.content}>
          {children}
        </div>
        <button className={styles.closeButton} onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  );
} 