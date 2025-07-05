import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

interface Project {
  _id: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
    unit: string;
  };
  materials: Array<{
    name: string;
    type: string;
    thickness?: number;
    color?: string;
    quantity: number;
    unit: string;
    cost?: number;
  }>;
  components: Array<{
    name: string;
    type: string;
    dimensions: {
      width: number;
      height: number;
      depth: number;
    };
    position: {
      x: number;
      y: number;
      z: number;
    };
    material?: string;
    color?: string;
    quantity: number;
  }>;
  settings: {
    joinery: string;
    finish: string;
    hardware: boolean;
  };
  files: {
    model3d?: string;
    drawings: string[];
    renderings: string[];
  };
  metadata: {
    totalCost: number;
    estimatedTime: number;
    difficulty: string;
    tags: string[];
  };
  isPublic: boolean;
  views: number;
  likes: string[];
  likeCount: number;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  createProject: (projectData: Partial<Project>) => Promise<Project>;
  updateProject: (id: string, projectData: Partial<Project>) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  getProject: (id: string) => Promise<Project>;
  getProjects: (filters?: any) => Promise<Project[]>;
  setCurrentProject: (project: Project | null) => void;
  likeProject: (id: string) => Promise<void>;
  calculateMaterials: (projectData: any) => Promise<any>;
  generateAI: (prompt: string) => Promise<any>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

interface ProjectProviderProps {
  children: ReactNode;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();

  const createProject = async (projectData: Partial<Project>): Promise<Project> => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create project');
      }

      const newProject = data.data.project;
      setProjects(prev => [newProject, ...prev]);
      toast.success('Проект создан успешно!');
      
      return newProject;
    } catch (error) {
      console.error('Create project error:', error);
      toast.error(error instanceof Error ? error.message : 'Ошибка создания проекта');
      throw error;
    }
  };

  const updateProject = async (id: string, projectData: Partial<Project>): Promise<Project> => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update project');
      }

      const updatedProject = data.data.project;
      setProjects(prev => prev.map(p => p._id === id ? updatedProject : p));
      
      if (currentProject?._id === id) {
        setCurrentProject(updatedProject);
      }

      toast.success('Проект обновлен успешно!');
      return updatedProject;
    } catch (error) {
      console.error('Update project error:', error);
      toast.error(error instanceof Error ? error.message : 'Ошибка обновления проекта');
      throw error;
    }
  };

  const deleteProject = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete project');
      }

      setProjects(prev => prev.filter(p => p._id !== id));
      
      if (currentProject?._id === id) {
        setCurrentProject(null);
      }

      toast.success('Проект удален успешно!');
    } catch (error) {
      console.error('Delete project error:', error);
      toast.error(error instanceof Error ? error.message : 'Ошибка удаления проекта');
      throw error;
    }
  };

  const getProject = async (id: string): Promise<Project> => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch project');
      }

      return data.data.project;
    } catch (error) {
      console.error('Get project error:', error);
      toast.error(error instanceof Error ? error.message : 'Ошибка загрузки проекта');
      throw error;
    }
  };

  const getProjects = async (filters?: any): Promise<Project[]> => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }

      const response = await fetch(`${API_BASE_URL}/projects?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch projects');
      }

      setProjects(data.data.projects);
      return data.data.projects;
    } catch (error) {
      console.error('Get projects error:', error);
      toast.error(error instanceof Error ? error.message : 'Ошибка загрузки проектов');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const likeProject = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to like project');
      }

      // Update project in list
      setProjects(prev => prev.map(p => {
        if (p._id === id) {
          return {
            ...p,
            likes: data.data.liked ? [...p.likes, 'current-user'] : p.likes.filter(l => l !== 'current-user'),
            likeCount: data.data.likeCount
          };
        }
        return p;
      }));

      // Update current project if it's the same
      if (currentProject?._id === id) {
        setCurrentProject(prev => prev ? {
          ...prev,
          likes: data.data.liked ? [...prev.likes, 'current-user'] : prev.likes.filter(l => l !== 'current-user'),
          likeCount: data.data.likeCount
        } : null);
      }

      toast.success(data.data.liked ? 'Проект добавлен в избранное!' : 'Проект удален из избранного');
    } catch (error) {
      console.error('Like project error:', error);
      toast.error(error instanceof Error ? error.message : 'Ошибка при добавлении в избранное');
      throw error;
    }
  };

  const calculateMaterials = async (projectData: any): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/furniture/calculate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate materials');
      }

      return data.data;
    } catch (error) {
      console.error('Calculate materials error:', error);
      toast.error(error instanceof Error ? error.message : 'Ошибка расчета материалов');
      throw error;
    }
  };

  const generateAI = async (prompt: string): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/suggest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate AI suggestions');
      }

      return data.data;
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Ошибка генерации ИИ');
      throw error;
    }
  };

  const value: ProjectContextType = {
    projects,
    currentProject,
    isLoading,
    createProject,
    updateProject,
    deleteProject,
    getProject,
    getProjects,
    setCurrentProject,
    likeProject,
    calculateMaterials,
    generateAI
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}; 