export interface RuntimeMetadata {
  name: string;
  version: string;
  backend: string;
}

export interface RuntimeCapabilities {
  canClick: boolean;
  canType: boolean;
  canScroll: boolean;
  canCapture: boolean;
}

export interface ObservationSnapshot {
  snapshotId: string;
  url: string;
  timestamp: number;
  graph: any;
  visual?: string; // base64 screenshot if applicable
}

export interface RuntimeCheckpoint {
  url: string;
  cookies: any[];
}
