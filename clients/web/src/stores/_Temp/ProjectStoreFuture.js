import { makeAutoObservable, runInAction } from 'mobx';
import api from '../services/api/api';

class ProjectStore {
  projects = new Map();
  stages = new Map();
  tasks = new Map();
  requirements = new Map();
  volumes = new Map();

  loading = false;
  error = null;

  constructor() {
    makeAutoObservable(this);
  }

  // ---------------------------
  // Computed Getters
  // ---------------------------
  getProjectsByOwner(ownerId) {
    return Array.from(this.projects.values()).filter(p => p.ownerId === ownerId);
  }

  getStagesByProjectId(projectId) {
    const project = this.projects.get(projectId);
    return project
      ? project.stageIds.map(id => this.stages.get(id)).filter(Boolean)
      : [];
  }

  getTasksByStageId(stageId) {
    const stage = this.stages.get(stageId);
    return stage
      ? stage.taskIds.map(id => this.tasks.get(id)).filter(Boolean)
      : [];
  }

  getTasksByProjectId(projectId) {
    return this.getStagesByProjectId(projectId)
      .flatMap(stage => this.getTasksByStageId(stage.id));
  }

  // ---------------------------
  // Reset Store
  // ---------------------------
  resetStore() {
    this.projects.clear();
    this.stages.clear();
    this.tasks.clear();
    this.requirements.clear();
    this.volumes.clear();
    this.loading = false;
    this.error = null;
  }

  // ---------------------------
  // Fetch Projects
  // ---------------------------
  async fetchProjects() {
    this.loading = true;
    this.error = null;

    try {
      const res = await api.get('/project/');
      const projects = res.data;

      runInAction(() => {
        projects.forEach(project => {
          const normalizedProject = {
            id: project.id,
            name: project.name,
            description: project.description,
            ownerId: project.owner_id,
            createdAt: project.created_at,
            stageIds: [],
          };

          this.projects.set(project.id, normalizedProject);

          project.stages.forEach(stage => {
            const normalizedStage = {
              id: stage.id,
              name: stage.name,
              description: stage.description,
              startDate: stage.start_date,
              deadline: stage.deadline,
              taskIds: [],
              projectId: project.id,
            };

            this.stages.set(stage.id, normalizedStage);
            normalizedProject.stageIds.push(stage.id);

            stage.tasks.forEach(task => {
              const normalizedTask = {
                id: task.id,
                name: task.name,
                description: task.description,
                performer: task.performer,
                deadline: task.deadline,
                progress: task.progress,
                priority: task.priority,
                requirementIds: [],
                volumeIds: [],
                stageId: stage.id,
              };

              this.tasks.set(task.id, normalizedTask);
              normalizedStage.taskIds.push(task.id);

              task.requirements.forEach(req => {
                this.requirements.set(req.id, {
                  id: req.id,
                  title: req.title,
                  description: req.description,
                  taskId: task.id,
                });
                normalizedTask.requirementIds.push(req.id);
              });

              task.volumes.forEach(vol => {
                this.volumes.set(vol.id, {
                  id: vol.id,
                  name: vol.name,
                  unit: vol.unit,
                  quantity: vol.quantity,
                  taskId: task.id,
                });
                normalizedTask.volumeIds.push(vol.id);
              });
            });
          });
        });
      });
    } catch (error) {
      runInAction(() => {
        this.error = error.message;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  // ---------------------------
  // Add New Project
  // ---------------------------
  addProject(project) {
    if (!this.projects.has(project.id)) {
      this.projects.set(project.id, {
        ...project,
        stageIds: [],
      });
    }
  }

  // ---------------------------
  // Add New Stage
  // ---------------------------
  addStage(stage) {
    if (!this.stages.has(stage.id)) {
      this.stages.set(stage.id, {
        ...stage,
        taskIds: [],
      });

      const project = this.projects.get(stage.projectId);
      if (project && !project.stageIds.includes(stage.id)) {
        project.stageIds.push(stage.id);
      }
    }
  }

  // ---------------------------
  // Add New Task
  // ---------------------------
  addTask(task) {
    if (!this.tasks.has(task.id)) {
      this.tasks.set(task.id, {
        ...task,
        requirementIds: [],
        volumeIds: [],
      });

      const stage = this.stages.get(task.stageId);
      if (stage && !stage.taskIds.includes(task.id)) {
        stage.taskIds.push(task.id);
      }
    }
  }

  // ---------------------------
  // Add Requirement
  // ---------------------------
  addRequirement(req) {
    if (!this.requirements.has(req.id)) {
      this.requirements.set(req.id, req);

      const task = this.tasks.get(req.taskId);
      if (task && !task.requirementIds.includes(req.id)) {
        task.requirementIds.push(req.id);
      }
    }
  }

  // ---------------------------
  // Add Volume
  // ---------------------------
  addVolume(vol) {
    if (!this.volumes.has(vol.id)) {
      this.volumes.set(vol.id, vol);

      const task = this.tasks.get(vol.taskId);
      if (task && !task.volumeIds.includes(vol.id)) {
        task.volumeIds.push(vol.id);
      }
    }
  }

  // ---------------------------
  // Delete Task + Cleanup
  // ---------------------------
  deleteTask(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) return;

    // Remove from stage
    const stage = this.stages.get(task.stageId);
    if (stage) {
      stage.taskIds = stage.taskIds.filter(id => id !== taskId);
    }

    // Remove requirements
    task.requirementIds.forEach(id => this.requirements.delete(id));

    // Remove volumes
    task.volumeIds.forEach(id => this.volumes.delete(id));

    // Remove task
    this.tasks.delete(taskId);
  }

  // ---------------------------
  // Delete Stage + Cleanup
  // ---------------------------
  deleteStage(stageId) {
    const stage = this.stages.get(stageId);
    if (!stage) return;

    // Remove tasks
    stage.taskIds.forEach(taskId => this.deleteTask(taskId));

    // Remove from project
    const project = this.projects.get(stage.projectId);
    if (project) {
      project.stageIds = project.stageIds.filter(id => id !== stageId);
    }

    // Remove stage
    this.stages.delete(stageId);
  }

  // ---------------------------
  // Delete Project + Cleanup
  // ---------------------------
  deleteProject(projectId) {
    const project = this.projects.get(projectId);
    if (!project) return;

    // Remove stages and their tasks
    project.stageIds.forEach(stageId => this.deleteStage(stageId));

    // Remove project
    this.projects.delete(projectId);
  }
}

export const projectStore = new ProjectStore();
