import { Project, ProjectStatus, User } from '../types';

const PROJECTS_KEY = 'kiosk_app_projects';
const USER_KEY = 'kiosk_app_user';

export const saveProject = (project: Project): void => {
  const existing = getProjects();
  const index = existing.findIndex(p => p.id === project.id);
  
  if (index >= 0) {
    existing[index] = project;
  } else {
    existing.push(project);
  }
  
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error("Storage full or error", e);
    alert("Warning: Local storage might be full. In a real app, this would upload to cloud.");
  }
};

export const getProjects = (): Project[] => {
  const data = localStorage.getItem(PROJECTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const getProjectById = (id: string): Project | undefined => {
  return getProjects().find(p => p.id === id);
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
};

export const getProjectsByStatus = (status: ProjectStatus): Project[] => {
  return getProjects().filter(p => p.status === status);
};