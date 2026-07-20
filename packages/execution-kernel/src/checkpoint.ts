export interface CheckpointData {
  url: string;
  cookies: any[];
}

export interface ICheckpointAdapter {
  createCheckpoint(sessionId: string): Promise<CheckpointData>;
  restoreCheckpoint(sessionId: string, checkpoint: CheckpointData): Promise<void>;
}
