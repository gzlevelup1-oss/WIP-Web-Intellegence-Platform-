export interface CheckpointData {
  url: string;
  cookies: any[];
  historyIndex?: number;
  localStorage?: Record<string, string>;
}

export interface ICheckpointAdapter {
  createCheckpoint(sessionId: string): Promise<CheckpointData>;
  restoreCheckpoint(sessionId: string, checkpoint: CheckpointData): Promise<void>;
}
