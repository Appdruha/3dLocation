'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';
import Modal from '../components/Modal/Modal';
import { tasks, Task } from '../data/tasks';

export default function GamePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  useEffect(() => {
    // Обработчик сообщений от iframe
    const handleMessage = (event: MessageEvent) => {
      // Проверяем источник сообщения для безопасности
      if (event.origin !== window.location.origin) return;
      
      // Обрабатываем сообщения
      if (event.data.type === 'console') {
        console.log('[Game Log]:', event.data.message);
      } else if (event.data.type === 'openTask') {
        // Получаем id задачи
        const taskId = event.data.message;
        const task = tasks[taskId];
        
        if (task) {
          console.log('Opening task:', task);
          setCurrentTask(task);
          setIsModalOpen(true);
        } else {
          console.error(`[Game Error]: Task with id "${taskId}" not found`);
        }
      }
    };

    // Добавляем слушатель
    window.addEventListener('message', handleMessage);

    // Убираем слушатель при размонтировании
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Добавляем лог для отслеживания состояния
  useEffect(() => {
    console.log('Modal state changed:', { isModalOpen, currentTask });
  }, [isModalOpen, currentTask]);

  return (
    <div className={styles.container}>
      <iframe 
        src="/index.html"
        className={styles.gameFrame}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
      
      <Modal 
        isOpen={isModalOpen}
        onClose={() => {
          console.log('Closing modal');
          setIsModalOpen(false);
        }}
        title={currentTask?.title || 'Задача'}
      >
        <p>{currentTask?.description}</p>
      </Modal>
    </div>
  );
} 