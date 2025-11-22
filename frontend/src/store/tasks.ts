import { create } from 'zustand';
import api from '@/lib/api';

export enum TaskStatus {
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE',
}

export interface Task {
    id: number;
    title: string;
    description?: string;
    status: TaskStatus;
    order: number;
    userId: number;
}

interface TaskState {
    tasks: Task[];
    isLoading: boolean;
    fetchTasks: () => Promise<void>;
    createTask: (title: string, description?: string, status?: TaskStatus) => Promise<void>;
    updateTask: (id: number, data: Partial<Task>) => Promise<void>;
    deleteTask: (id: number) => Promise<void>;
    setTasks: (tasks: Task[]) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
    tasks: [],
    isLoading: false,
    fetchTasks: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/tasks');
            set({ tasks: response.data });
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            set({ isLoading: false });
        }
    },
    createTask: async (title, description, status) => {
        try {
            const response = await api.post('/tasks', { title, description, status });
            set((state) => ({ tasks: [...state.tasks, response.data] }));
        } catch (error) {
            console.error('Error creating task:', error);
        }
    },
    updateTask: async (id, data) => {
        // Optimistic update
        set((state) => ({
            tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...data } : t)),
        }));
        try {
            await api.patch(`/tasks/${id}`, data);
        } catch (error) {
            console.error('Error updating task:', error);
            // Revert on error (could be improved)
            get().fetchTasks();
        }
    },
    deleteTask: async (id) => {
        set((state) => ({
            tasks: state.tasks.filter((t) => t.id !== id),
        }));
        try {
            await api.delete(`/tasks/${id}`);
        } catch (error) {
            console.error('Error deleting task:', error);
            get().fetchTasks();
        }
    },
    setTasks: (tasks) => set({ tasks }),
}));
