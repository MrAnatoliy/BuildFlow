import { makeObservable, observable, action, computed, runInAction } from 'mobx';
import axios from 'axios';

class ProjectStore {
  users          = {};
  projects       = {};
  shortProjects  = {};
  stages         = {};
  tasks          = {};
  requirements   = {};
  volumes        = {};
  executors      = {};
  executorTasks  = [];
  
  constructor() {
    makeObservable(this, {
      users:                observable,
      projects:             observable,
      shortProjects:        observable,
      stages:               observable,
      tasks:                observable,
      requirements:         observable,
      volumes:              observable,
      executors:            observable,
      executorTasks:        observable,

      projectList:          computed,
      shortProjectList:     computed,
      executorProjectList:  computed,
      fetchProjects:        action,
      fetchShortProjects:   action,
      addProject:           action,
      deleteProject:        action,
      getProjectById:       action,

      addStage:             action,
      updateStage:          action,
      deleteStage:          action,
      
      fetchTasksByStageId:  action,
      fetchTaskById:        action,
      addTask:              action,
      updateTask:           action,
      deleteTask:           action,
      getTasksByExecutorId: action,

      fetchRequirements:    action,
      createRequirement:    action,
      updateRequirement:    action,
      deleteRequirement:    action,

      fetchVolumes:         action,
      createVolume:         action,
      updateVolume:         action,
      deleteVolume:         action,

      fetchExecutorTasks:   action,

    });

    axios.defaults.baseURL = 'http://buildflow.api';
    axios.defaults.withCredentials = true;
  }

  // --- PROJECT ----------------------------------------------------------------------

  get projectList() {
    return Object.values(this.projects);
  }

  get shortProjectList() {
    return Object.values(this.shortProjects);
  }

  get executorProjectList() {
    return Object.values(this.shortProjects);
  }

  async fetchProjects() {
    try {
      const response = await axios.get('/project/');
      runInAction(() => {
        response.data.forEach(projectData => {
          this.projects[projectData.id] = {
            id:          projectData.id,
            name:        projectData.name,
            description: projectData.description,
            createdAt:   projectData.created_at,
            ownerId:     projectData.owner_id,
            stageIds:    projectData.stages.map(s => s.id),
          };
          projectData.stages.forEach(stageData => {
            this.stages[stageData.id] = {
              id:          stageData.id,
              projectId:   projectData.id,
              name:        stageData.name,
              description: stageData.description,
              start_date:   stageData.start_date,
              end_date:     stageData.end_date,
              budget:      stageData.budget,
              taskIds:     [],
            };
          });
        });
      });
    } catch (error) {
      console.error('Ошибка загрузки проектов:', error);
    }
  }

async fetchExecutorProjects(taskGroupsData) {
  try {
    // Если taskGroupsData не передан, делаем запрос самостоятельно
    if (!taskGroupsData) {
      const tasksResponse = await axios.get('/localUser/me/tasks');
      taskGroupsData = tasksResponse.data;
    }

    const projectIds = Object.keys(taskGroupsData).map(Number);
    console.log('ID проектов из задач исполнителя:', projectIds);

    const projects = await Promise.all(
      projectIds.map(id =>
        axios.get(`/project/short/${id}`)
          .then(res => res.data)
          .catch(err => {
            console.warn(`Ошибка получения проекта ${id}:`, err.response?.status);
            return null;
          })
      )
    );

    runInAction(() => {
      this.shortProjects = projects
        .filter(p => p !== null)
        .reduce((acc, project) => {
          acc[project.id] = {
            id: project.id,
            name: project.name,
            description: project.description,
            createdAt: project.created_at,
            ownerId: project.owner_id,
          };
          return acc;
        }, {});
    });

  } catch (error) {
    console.error('Ошибка загрузки проектов исполнителя:', error);
  }
}

async fetchExecutorTasks() {
  try {
    const response = await axios.get('/localUser/me/tasks');
    const taskGroups = response.data;

    // Передаем taskGroups в fetchExecutorProjects
    await this.fetchExecutorProjects(taskGroups);

    runInAction(() => {
      this.executorTasks = [];
    });

    const projectIds = Object.keys(taskGroups).map(Number);
    
    // Загружаем полные данные по проектам (если необходимо)
    await Promise.all(
      projectIds.map(id => this.getProjectById(id))
    );

    // Обрабатываем задачи
    const allTasks = [];
    
    Object.entries(taskGroups).forEach(([projectId, tasks]) => {
      tasks.forEach(task => {
        this.tasks[task.id] = {
          ...task,
          project_id: Number(projectId),
          executorIds: task.executors?.map(e => e.id) || [],
          requirementIds: task.requirements?.map(r => r.id) || [],
          volumeIds: task.volumes?.map(v => v.id) || []
        };

        task.executors?.forEach(executor => {
          this.executors[executor.id] = executor;
        });

        task.requirements?.forEach(requirement => {
          this.requirements[requirement.id] = requirement;
        });

        task.volumes?.forEach(volume => {
          this.volumes[volume.id] = volume;
        });

        allTasks.push(this.tasks[task.id]);
      });
    });

    runInAction(() => {
      this.executorTasks = allTasks;
    });

  } catch (error) {
    console.error('Ошибка загрузки задач:', error);
  }
}
  
  getExecutorTasksByProjectId(projectId) {
    return this.executorTasks.filter(t => t.project_id === projectId);
  }


  async fetchShortProjects() {
    try {
      const { data } = await axios.get('/project/'); // Измененный URL
      runInAction(() => {
        this.shortProjects = data.reduce((acc, project) => ({
          ...acc,
          [project.id]: {
            id: Number(project.id),
            name: project.name,
            description: project.description,
            ownerId: project.owner_id,
            createdAt: project.created_at,
          }
        }), {});
      });
    } catch (err) {
      console.error('Ошибка загрузки проектов:', err);
    }
  }

  getProjectsByExecutorId(userId) {
    const taskIds = this.getTasksByExecutorId(userId).map(t => t.id);
    const stageIds = taskIds.map(taskId => this.tasks[taskId]?.stage_id).filter(Boolean);
    const projectIds = stageIds.map(sid => this.stages[sid]?.projectId).filter(Boolean);

    const uniqueIds = [...new Set(projectIds)];
    return uniqueIds.map(pid => this.projects[pid]).filter(Boolean);
  }

  async addProject(data, ownerId) {
    try {
      const response = await axios.post('/project/', {
        name:        data.name,
        description: data.description,
        owner_id:    ownerId,
      });
      const projectData = response.data;
      runInAction(() => {
        this.projects[projectData.id] = {
          id:          projectData.id,
          name:        projectData.name,
          description: projectData.description,
          createdAt:   projectData.created_at,
          ownerId:     projectData.owner_id,
          stageIds:    [],
        };
      });
      return this.projects[projectData.id];
    } catch (error) {
      console.error('Ошибка создания проекта:', error);
      return null;
    }
  }

  async deleteProject(projectId) {
    try {
      await axios.delete(`/project/${projectId}`);
      runInAction(() => {
        delete this.projects[projectId];
        Object.values(this.stages)
          .filter(s => s.projectId === projectId)
          .forEach(s => delete this.stages[s.id]);
      });
    } catch (error) {
      console.error('Ошибка удаления проекта:', error);
    }
  }

  async getProjectById(projectId) {
    try {
      const response = await axios.get(`/project/${projectId}`);
      const projectData = response.data;
      runInAction(() => {
        this.projects[projectData.id] = {
          id:          projectData.id,
          name:        projectData.name,
          description: projectData.description,
          createdAt:   projectData.created_at,
          ownerId:     projectData.owner_id,
          stageIds:    projectData.stages.map(s => s.id),
        };
        projectData.stages.forEach(stageData => {
          this.stages[stageData.id] = {
            id:          stageData.id,
            projectId:   projectData.id,
            name:        stageData.name,
            description: stageData.description,
            start_date:   stageData.start_date,
            end_date:     stageData.end_date,
            budget:      stageData.budget,
            taskIds:     [],
          };
        });
      });
      return this.projects[projectData.id];
    } catch (error) {
      console.error('Ошибка получения проекта:', error);
      return null;
    }
  }

  // --- STAGES ----------------------------------------------------------------------

  getStagesByProjectId(projectId) {
    return Object.values(this.stages)
      .filter(stage => stage.projectId === projectId);
  }

  // 6) Добавить новую стадию
  async addStage(projectId, stageFormData) {
    try {
      const payload = {
        name:        stageFormData.name,
        description: stageFormData.description || '',
        start_date:  stageFormData.start_date,
        end_date:    stageFormData.end_date,
        budget:      stageFormData.budget || 0,
        project_id:  projectId,
      };
      const response = await axios.post('/stage', payload);
      const stageData = response.data;
      runInAction(() => {
        this.stages[stageData.id] = {
          id:          stageData.id,
          projectId:   projectId,
          name:        stageData.name,
          description: stageData.description,
          start_date:   stageData.start_date,
          end_date:     stageData.end_date,
          budget:      stageData.budget,
          taskIds:     [],
        };
        if (this.projects[projectId]) {
          this.projects[projectId].stageIds.push(stageData.id);
        }
      });
      return this.stages[stageData.id];
    } catch (error) {
      console.error('Ошибка создания стадии:', error);
      throw error;
    }
  }

  async updateStage(projectId, stageData) {
    try {
      const response = await axios.put(`/stage/${stageData.id}`, stageData);
      runInAction(() => {
        this.stages[stageData.id] = {
          ...this.stages[stageData.id],
          ...response.data
        };
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка обновления этапа:', error);
      throw error;
    }
  }

  // 7) Удалить стадию
  async deleteStage(stageId) {
    try {
      await axios.delete(`/stage/${stageId}`);
      runInAction(() => {
        const projId = this.stages[stageId]?.projectId;
        if (projId && this.projects[projId]) {
          this.projects[projId].stageIds =
            this.projects[projId].stageIds.filter(id => id !== stageId);
        }
        delete this.stages[stageId];
      });
    } catch (error) {
      console.error('Ошибка удаления стадии:', error);
    }
  }

  // --- TASKS ----------------------------------------------------------------------

  // 8) Загрузить задачи этапа с бэка
  async fetchTasksByStageId(stageId) {
    try {
      const response = await axios.get(`/stage/${stageId}/tasks/`);
      const tasksArray = response.data;

      console.log('Ответ с сервера по задачам:', tasksArray);

      runInAction(() => {
        tasksArray.forEach(taskData => {
        const taskId = taskData.id;

        // Сохраняем задачу
        this.tasks[taskId] = {
          ...taskData,
          requirementIds: [],
          volumeIds: [],
          executorIds: [],
        };

        // Сохраняем требования
        if (Array.isArray(taskData.requirements)) {
          this.tasks[taskId].requirementIds = taskData.requirements.map(r => r.id);
          taskData.requirements.forEach(r => {
            this.requirements[r.id] = r;
          });
        }

        // Сохраняем объемы
        if (Array.isArray(taskData.volumes)) {
          this.tasks[taskId].volumeIds = taskData.volumes.map(v => v.id);
          taskData.volumes.forEach(v => {
            this.volumes[v.id] = v;
          });
        }

        // 🔥 Сохраняем исполнителей
        if (Array.isArray(taskData.executors)) {
          this.tasks[taskId].executorIds = taskData.executors.map(e => e.id);
          taskData.executors.forEach(e => {
            this.executors[e.id] = e;
          });
        }
      });

        // Привязываем задачи к стадии
        if (this.stages[stageId]) {
          this.stages[stageId].taskIds = tasksArray.map(td => td.id);
        }
      });
      return tasksArray;
    } catch (error) {
        console.error(`Ошибка загрузки задач для стадии ${stageId}:`, error);
      return [];
    }
  }

  // 9) Получить задачи из стора
  getTasksByStageId(stageId) {
    const stage = this.stages[stageId];
    if (!stage) return [];
    if (!Array.isArray(stage.taskIds)) {
      stage.taskIds = [];
    }
    return stage.taskIds.map(id => this.tasks[id]).filter(Boolean);
  }

  getTasksByExecutorId(userId) {
    return this.executorTasks.filter(task =>
      Array.isArray(task.executorIds)
        ? task.executorIds.includes(userId)
        : false
    );
  }

  // 10) Загрузить задачу по ID (если нужно)
  async fetchTaskById(taskId) {
    try {
      const response = await axios.get(`/task/${taskId}`);
      runInAction(() => {
        this.tasks[response.data.id] = response.data;
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка загрузки задачи:', error);
      return null;
    }
  }

  // 11) Создать задачу
async addTask(taskData) {
  try {
    const response = await axios.post('/task/', {
      name: taskData.name,
      description: taskData.description,
      start_date: taskData.start_date,
      end_date: taskData.end_date,
      priority: taskData.priority,
      stage_id: taskData.stage_id
    });
    
    runInAction(() => {
      const newTask = response.data;
      this.tasks[newTask.id] = newTask;
      
      // Добавляем связь с этапом
      if (this.stages[newTask.stage_id]) {
        this.stages[newTask.stage_id].taskIds.push(newTask.id);
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Ошибка добавления задачи:', error);
    throw error;
  }
}
  // 12) Обновить задачу
  async updateTask(taskId, taskData) {
    try {
      const response = await axios.put(`/task/${taskId}`, taskData);
      runInAction(() => {
        this.tasks[taskId] = response.data;
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка обновления задачи:', error);
      throw error;
    }
  }

  // 13) Удалить задачу
  async deleteTask(taskId) {
    try {
      await axios.delete(`/task/${taskId}`);
      runInAction(() => {
        delete this.tasks[taskId];
        // убрать из taskIds у стадии
        Object.values(this.stages).forEach(stage => {
          if (stage.taskIds.includes(taskId)) {
            stage.taskIds = stage.taskIds.filter(id => id !== taskId);
          }
        });
      });
    } catch (error) {
      console.error('Ошибка удаления задачи:', error);
    }
  }
  
// --- REQUIREMENTS ----------------------------------------------------------------------

  async fetchRequirements(projectId) {
    try {
      const res = await axios.get(`/requirement/${projectId}`);
      runInAction(() => {
        res.data.forEach(req => {
          this.requirements[req.id] = req;
        });
      });
    } catch (error) {
      console.error("Ошибка при загрузке требований:", error);
    }
  }

  async createRequirement(taskId, requirementData) {
    try {
      const payload = {
        task_id: taskId,
        name: requirementData.name,
        description: requirementData.description || '',
        is_completed: requirementData.is_completed || false,
        completed_at: requirementData.is_completed ? new Date().toISOString() : null
      };

      const response = await axios.post('/requirement/', payload);
      const requirement = response.data;

      runInAction(() => {
        this.requirements[requirement.id] = {
          id: requirement.id,
          task_id: taskId,
          name: requirement.name,
          description: requirement.description,
          is_completed: requirement.is_completed,
          completed_at: requirement.completed_at
        };

        if (this.tasks[taskId]) {
          if (!this.tasks[taskId].requirementIds) {
            this.tasks[taskId].requirementIds = [];
          }
          this.tasks[taskId].requirementIds.push(requirement.id);
        }
      });

      return this.requirements[requirement.id];
    } catch (error) {
      console.error("Ошибка при создании требования:", error);
      throw error;
    }
  }

  async updateRequirement(requirementId, updatedData) {
    try {
      const requirement = this.requirements[requirementId];
      if (!requirement) throw new Error("Requirement not found");

      const payload = {
        name: updatedData.name,
        description: updatedData.description || '',
        is_completed: updatedData.is_completed || false,
        completed_at: updatedData.is_completed ? new Date().toISOString() : null
      };

      const response = await axios.put(`/requirement/${requirementId}`, payload, {
        params: {
          task_id: requirement.task_id
        }
      });

      runInAction(() => {
        this.requirements[requirementId] = response.data;
      });

      return this.requirements[requirementId];
    } catch (error) {
      console.error("Ошибка при обновлении требования:", error);
      throw error;
    }
  }

  async deleteRequirement(requirementId) {
    try {
      const requirement = this.requirements[requirementId];
      if (!requirement) throw new Error("Requirement not found");

      await axios.delete(`/requirement/${requirementId}`, {
        params: {
          task_id: requirement.task_id
        }
      });

      runInAction(() => {
        delete this.requirements[requirementId];
        if (this.tasks[requirement.task_id]) {
          const task = this.tasks[requirement.task_id];
          task.requirementIds = task.requirementIds.filter(id => id !== requirementId);
        }
      });

      return true;
    } catch (error) {
      console.error("Ошибка при удалении требования:", error);
      throw error;
    }
  }

  getRequirementsByTaskId(taskId) {
    const task = this.tasks[taskId];
    if (!task || !Array.isArray(task.requirementIds)) return [];
    return task.requirementIds.map(reqId => this.requirements[reqId]).filter(Boolean);
  }

// --- VOLUMES ----------------------------------------------------------------------

  async fetchVolumes(projectId) {
    try {
      const res = await axios.get(`/volume/${projectId}`);
      runInAction(() => {
        res.data.forEach(vol => {
          this.volumes[vol.id] = vol;
        });
      });
    } catch (error) {
      console.error("Ошибка при загрузке объемов:", error);
    }
  }

  async createVolume(taskId, volumeData) {
    try {
      const payload = {
        task_id: taskId,
        name: volumeData.name,
        current_volume: volumeData.current_volume || 0,
        whole_volume: volumeData.whole_volume || 0,
        metrics: volumeData.metrics
      };

      const response = await axios.post('/volume/', payload, {
        params: {
          task_id: taskId
        }
      });
      const volume = response.data;

      runInAction(() => {
        this.volumes[volume.id] = {
          id: volume.id,
          task_id: volume.task_id,
          name: volume.name,
          current_volume: volume.current_volume,
          whole_volume: volume.whole_volume,
          metrics: volume.metrics
        };

        if (this.tasks[taskId]) {
          if (!this.tasks[taskId].volumeIds) {
            this.tasks[taskId].volumeIds = [];
          }
          this.tasks[taskId].volumeIds.push(volume.id);
        }
      });

      return this.volumes[volume.id];
    } catch (error) {
      console.error("Ошибка при создании объема:", error);
      throw error;
    }
  }

  async updateVolume(taskId, volumeId, updatedData) {
    try {
      const payload = { // Убрано task_id из payload
        name: updatedData.name,
        current_volume: updatedData.current_volume,
        whole_volume: updatedData.whole_volume,
        metrics: updatedData.metrics
      };

      const response = await axios.put(`/volume/${volumeId}/`, payload, {
        params: { 
          task_id: taskId 
        }
      });

      runInAction(() => {
        if (this.volumes[volumeId]) {
          this.volumes[volumeId] = response.data;
        }
      });

      return this.volumes[volumeId];
    } catch (error) {
      console.error("Ошибка при обновлении объема:", error);
      throw error;
    }
  }


  async deleteVolume(volumeId) {
    try {
      const volume = this.volumes[volumeId];
      if (!volume) throw new Error("Volume not found");

      await axios.delete(`/volume/${volumeId}/`, {
        params: { 
          task_id: volume.task_id 
        }
      });

      runInAction(() => {
        delete this.volumes[volumeId];
        if (this.tasks[volume.task_id]) {
          const task = this.tasks[volume.task_id];
          task.volumeIds = task.volumeIds.filter(id => id !== volumeId);
        }
      });

      return true;
    } catch (error) {
      console.error("Ошибка при удалении объема:", error);
      throw error;
    }
  }

  getVolumesByTaskId(taskId) {
    const task = this.tasks[taskId];
    if (!task || !Array.isArray(task.volumeIds)) return [];
    return task.volumeIds.map(volumeId => this.volumes[volumeId]).filter(Boolean);
  }

// --- USERS ----------------------------------------------------------------------

  async fetchAllUsers() {
    try {
      const response = await axios.get('/user/all');
      runInAction(() => {
        response.data.users.forEach(user => {
          this.users[user.id] = {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          };
        });
      });
    } catch (error) {
      console.error("Ошибка загрузки пользователей:", error);
    }
  }

// --- EXECUTORS ----------------------------------------------------------------------
  


  
  getExecutorsByTaskId(taskId) {
    const task = this.tasks[taskId];
    if (!task || !Array.isArray(task.executorIds)) return [];
    return task.executorIds
      .map(id => this.executors[id])
      .filter(Boolean);
  }

  async createExecutor(taskId, userId, role) {
    try {
      const payload = { task_id: taskId, user_id: userId, role };
      const response = await axios.post('/executor/', payload);
      const executor = response.data;
      runInAction(() => {
        this.executors[executor.id] = executor;
        if (!this.tasks[taskId]) return;
        if (!Array.isArray(this.tasks[taskId].executorIds)) {
          this.tasks[taskId].executorIds = [];
        }
        this.tasks[taskId].executorIds.push(executor.id);
      });
      return executor;
    } catch (error) {
      console.error('Ошибка создания исполнителя:', error);
      throw error;
    }
  }

  async updateExecutor(taskId, executorId, role) {
    try {
      const response = await axios.put(`/executor/${executorId}`, { role });
      runInAction(() => {
        if (this.executors[executorId]) {
          this.executors[executorId].role = role;
        }
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка обновления исполнителя:', error);
      throw error;
    }
  }

  async deleteExecutor(executorId) {
    try {
      await axios.delete(`/executor/${executorId}`);
      runInAction(() => {
        const ex = this.executors[executorId];
        if (!ex) return;
        // удаляем из tasks[].executorIds
        const task = this.tasks[ex.task_id];
        if (task && Array.isArray(task.executorIds)) {
          task.executorIds = task.executorIds.filter(id => id !== executorId);
        }
        // удаляем сам объект
        delete this.executors[executorId];
      });
    } catch (error) {
      console.error('Ошибка удаления исполнителя:', error);
      throw error;
    }
  }

}

export const projectStore = new ProjectStore();
