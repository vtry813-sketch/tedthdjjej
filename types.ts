
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export enum BotStatus {
  RUNNING = 'RUNNING',
  STOPPED = 'STOPPED',
  EXPIRED = 'EXPIRED',
  DEPLOYING = 'DEPLOYING'
}

export enum LogType {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  SYSTEM = 'SYSTEM'
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  coins: number;
  isVerified: boolean;
  isBanned: boolean;
  referralCode: string;
  lastDailyClaim?: string;
  createdAt: string;
}

export interface Bot {
  id: string;
  name: string;
  ownerId: string;
  repoUrl?: string;
  zipUrl?: string;
  status: BotStatus;
  expiresAt: string;
  cpuLimit: number;
  memoryLimit: number;
  logs: BotLog[];
  createdAt: string;
}

export interface BotLog {
  timestamp: string;
  type: LogType;
  message: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'DAILY' | 'REFERRAL' | 'DEPLOY' | 'TRANSFER' | 'ADMIN' | 'EXPIRE';
  description: string;
  timestamp: string;
}
