export interface Task {
  id: string;
  title: string;
  description: string;
}

export const tasks: Record<string, Task> = {
  'task1': {
    id: 'task1',
    title: 'Задание 1',
    description: 'Текст задания'
  },
  'task2': {
    id: 'task2',
    title: 'Задание 2',
    description: 'Текст задания'
  },
  'task3': {
    id: 'task3',
    title: 'Задание 3',
    description: 'Текст задания'
  },
  'task4': {
    id: 'task4',
    title: 'Задание 4',
    description: 'Текст задания'
  },
}; 