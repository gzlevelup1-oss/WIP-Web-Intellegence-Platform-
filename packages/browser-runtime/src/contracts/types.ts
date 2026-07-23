export interface RuntimeMetadata {
  name: string;
  version: string;
  backend: string;
  platform: string;
  viewport: { width: number, height: number };
  locale: string;
  timezone: string;
  userAgent: string;
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
  hash: string;
  metadata: Record<string, any>;
}

export interface RuntimeCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "Strict" | "Lax" | "None";
}

export interface RuntimeOriginStorage {
  origin: string;
  localStorage: Array<{
    name: string;
    value: string;
  }>;
}

export interface RuntimeCheckpoint {
  url: string;
  cookies: RuntimeCookie[];
  origins?: RuntimeOriginStorage[];
  historyIndex?: number;
}
