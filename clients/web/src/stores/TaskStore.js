import { makeAutoObservable, runInAction } from "mobx";

class TaskStore {
  tasks = [];
  openStates = {};
  progressNotification = {};
  accordionMode = true;

  constructor() {
    makeAutoObservable(this);
  }

  setTasks(tasks) {
    this.tasks = tasks;
    this.openStates = {};
    this.progressNotification = {};

    tasks.forEach((task) => {
      const isNew = JSON.parse(localStorage.getItem(`task-${task.id}-isNew`)) ?? true;
      const isProgress = JSON.parse(localStorage.getItem(`task-${task.id}-isProgress`)) ?? true;

      this.openStates[task.id] = {
        isOpen: false,
        isNew,
        isProgress,
      };

      this.progressNotification[task.id] = false;
    });
  }

  formatPriority(priority) {
    switch (priority) {
      case 1: return 'Низкий';
      case 2: return 'Средний';
      case 3: return 'Высокий';
      default: return 'Низкий';
    }
  }

  toggleTask(id) {
    if (!this.openStates[id]) {
      // Если состояния для этой задачи нет, создаём его по умолчанию
      this.openStates[id] = {
        isOpen: false,
        isNew: true,
        isProgress: true,
      };
    }

    // Переключаем состояние задачи
    this.openStates[id].isOpen = !this.openStates[id].isOpen;

    // Если задача была открыта, сбрасываем флаг isNew и сохраняем это в localStorage
    if (this.openStates[id].isOpen) {
      this.openStates[id].isNew = false;
      this.openStates[id].isProgress = false;
      localStorage.setItem(`task-${id}-isNew`, JSON.stringify(false));
      localStorage.setItem(`task-${id}-isProgress`, JSON.stringify(false));
    }

    if (this.accordionMode) {
      // Закрыть все задачи, открыть только выбранную
      Object.keys(this.openStates).forEach((key) => {
        if (Number(key) !== id) {
          this.openStates[key].isOpen = false;
        }
      });
    }
  }
  
  isTaskOpen(id) {
    return this.openStates[id]?.isOpen ?? false;
  }

  isTaskNew(id) {
    return this.openStates[id]?.isNew ?? false;
  }

  isTaskProgress(id) {
    return this.openStates[id]?.isProgress ?? false;
  }

  updateProgress(id, newProgress) {
    const task = this.tasks.find((t) => t.id === id);
    if (task) {
      task.progress.current = newProgress;
      this.progressNotification[id] = true;
    }
  }

  hideProgressNotification(id) {
    this.progressNotification[id] = false;
  }

  saveTaskState(id) {
    const taskState = this.openStates[id];
    if (taskState) {
      localStorage.setItem(`task-${id}-isNew`, JSON.stringify(taskState.isNew));
      localStorage.setItem(`task-${id}-isProgress`, JSON.stringify(taskState.isProgress));
    }
  }

  setAccordionMode(value) {
    this.accordionMode = value;
  }
}

export const taskStore = new TaskStore();
