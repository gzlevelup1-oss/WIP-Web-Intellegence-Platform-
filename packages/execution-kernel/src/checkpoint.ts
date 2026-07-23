export interface CheckpointCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "Strict" | "Lax" | "None";
}

export interface CheckpointOriginStorage {
  origin: string;
  localStorage: Array<{
    name: string;
    value: string;
  }>;
}

export interface CheckpointData {
  checkpointId: string;
  sessionId: string;
  timestamp: number;
  snapshotHash?: string;
  url: string;
  cookies: CheckpointCookie[];
  historyIndex?: number;
  localStorage?: Record<string, string>;
  origins?: CheckpointOriginStorage[];
}

export interface ICheckpointAdapter {
  createCheckpoint(sessionId: string): Promise<CheckpointData>;
  restoreCheckpoint(sessionId: string, checkpoint: CheckpointData): Promise<void>;
}
