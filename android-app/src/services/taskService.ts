import api from './api';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  user: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: 'pending' | 'in-progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags?: string[];
}

export interface UpdateTaskData extends Partial<CreateTaskData> {}

export const taskService = {
  // Get all tasks for the authenticated user
  getTasks: () => {
    return api.get<Task[]>('/tasks');
  },

  // Get a specific task by ID
  getTask: (id: string) => {
    return api.get<Task>(`/tasks/${id}`);
  },

  // Create a new task
  createTask: (taskData: CreateTaskData) => {
    return api.post<Task>('/tasks', taskData);
  },

  // Update a task
  updateTask: (id: string, taskData: UpdateTaskData) => {
    return api.put<Task>(`/tasks/${id}`, taskData);
  },

  // Delete a task
  deleteTask: (id: string) => {
    return api.delete<{ message: string }>(`/tasks/${id}`);
  },

  // Update task status
  updateTaskStatus: (id: string, status: 'pending' | 'in-progress' | 'completed') => {
    return api.patch<Task>(`/tasks/${id}/status`, { status });
  },

  // Update task priority
  updateTaskPriority: (id: string, priority: 'low' | 'medium' | 'high') => {
    return api.patch<Task>(`/tasks/${id}/priority`, { priority });
  },

  // Get tasks by status
  getTasksByStatus: (status: 'pending' | 'in-progress' | 'completed') => {
    return api.get<Task[]>(`/tasks/status/${status}`);
  },

  // Get tasks by priority
  getTasksByPriority: (priority: 'low' | 'medium' | 'high') => {
    return api.get<Task[]>(`/tasks/priority/${priority}`);
  },

  // Search tasks
  searchTasks: (query: string) => {
    return api.get<Task[]>(`/tasks/search?q=${encodeURIComponent(query)}`);
  },

  // Get task statistics
  getTaskStats: () => {
    return api.get<{
      total: number;
      pending: number;
      inProgress: number;
      completed: number;
      byPriority: {
        low: number;
        medium: number;
        high: number;
      };
    }>('/tasks/stats');
  },
};