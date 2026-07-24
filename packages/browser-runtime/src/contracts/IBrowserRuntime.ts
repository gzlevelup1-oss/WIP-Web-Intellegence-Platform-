import { RuntimeMetadata, RuntimeCapabilities, ObservationSnapshot, RuntimeCheckpoint } from './types.js';

export type BrowserRuntimeEvent =
  | { type: 'Event.Network.RequestSent'; payload: { requestId: string; url: string; method: string } }
  | { type: 'Event.Network.ResponseReceived'; payload: { requestId: string; status: number; mimeType: string } }
  | { type: 'Event.Page.Console'; payload: { type: string; message: string } }
  | { type: 'Event.Lifecycle.FontsReady'; payload: { timestamp: number } }
  | { type: 'Event.Lifecycle.AnimationsStable'; payload: { timestamp: number } };

export interface IBrowserRuntime {
    getMetadata(): Promise<RuntimeMetadata>;
    getCapabilities(): Promise<RuntimeCapabilities>;
    createSession(): Promise<string>;
    closeSession(sessionId: string): Promise<void>;
    navigate(sessionId: string, url: string): Promise<void>;
    capture(sessionId: string, levels: (number | string)[]): Promise<ObservationSnapshot>;
    click(sessionId: string, nodeId: string, modifiers?: string[]): Promise<void>;
    type(sessionId: string, nodeId: string, text: string, delay?: number): Promise<void>;
    scroll(sessionId: string, distanceY: number, behavior?: string): Promise<void>;
    createCheckpoint(sessionId: string): Promise<RuntimeCheckpoint>;
    restoreCheckpoint(sessionId: string, checkpoint: RuntimeCheckpoint, options?: { soft?: boolean }): Promise<void>;
    
    // Event Emitter interface
    on(event: string, listener: (event: BrowserRuntimeEvent) => void): void;
    off(event: string, listener: (event: BrowserRuntimeEvent) => void): void;
}
