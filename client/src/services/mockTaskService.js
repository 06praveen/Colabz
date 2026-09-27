import { mockTasks } from '../mock/tasks';

let localTasksStore = [...mockTasks];

export const mockTaskService = {
  async getTasks(projectId) {
    return localTasksStore.filter((t) => t.projectId === projectId || !projectId);
  },

  async getTaskById(projectId, taskId) {
    const task = localTasksStore.find((t) => (t.id === taskId || t.identifier === taskId) && (t.projectId === projectId || !projectId));
    return task || localTasksStore.find((t) => t.id === taskId || t.identifier === taskId) || null;
  },

  async createTask(projectId, taskData) {
    const nextNum = localTasksStore.length + 1;
    const newTask = {
      id: `task_${Date.now()}`,
      identifier: `COL-${nextNum}`,
      projectId: projectId || 'proj_1',
      title: taskData.title,
      description: taskData.description || '',
      status: taskData.status || 'TODO',
      priority: taskData.priority || 'Medium',
      assignee: taskData.assignee || { name: 'Praveen Tiwari', initials: 'PR', role: 'Maintainer' },
      labels: taskData.labels || ['Frontend'],
      dueDate: taskData.dueDate || '2026-10-10',
      createdAt: 'Just now',
      updatedAt: 'Just now',
      activity: [
        { id: `act_${Date.now()}`, user: 'Praveen Tiwari', action: 'created the task', time: 'Just now' }
      ]
    };

    localTasksStore.unshift(newTask);
    return newTask;
  },

  async updateTask(projectId, taskId, updates) {
    const index = localTasksStore.findIndex((t) => t.id === taskId || t.identifier === taskId);
    if (index === -1) return null;

    const oldTask = localTasksStore[index];
    const updatedTask = {
      ...oldTask,
      ...updates,
      updatedAt: 'Just now',
      activity: [
        { id: `act_${Date.now()}`, user: 'Praveen Tiwari', action: 'updated task details', time: 'Just now' },
        ...(oldTask.activity || [])
      ]
    };

    localTasksStore[index] = updatedTask;
    return updatedTask;
  },

  async deleteTask(projectId, taskId) {
    localTasksStore = localTasksStore.filter((t) => t.id !== taskId && t.identifier !== taskId);
    return true;
  }
};
