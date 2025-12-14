export enum UserRole {
  ADMIN = 'ADMIN',
  FIELD_USER = 'FIELD_USER',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Store {
  id: string;
  district: string;
  storeNumber: string;
  storeName: string;
  address: string;
}

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface CapturedImage {
  id: string;
  dataUrl: string; // Base64
  timestamp: string;
  location: GeoLocation;
  type: 'BEFORE' | 'AFTER' | 'RECEIVING';
}

export enum ProjectStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

export interface Project {
  id: string;
  storeId: string;
  userId: string;
  status: ProjectStatus;
  startedAt: string;
  completedAt?: string;
  images: {
    before: CapturedImage[];
    after: CapturedImage[];
    receiving: CapturedImage[];
  };
  geminiAudit?: string; // AI generated feedback
}

export interface DashboardStats {
  total: number;
  completed: number;
  pending: number;
}