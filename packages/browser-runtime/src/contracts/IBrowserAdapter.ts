import { RuntimeMetadata, RuntimeCapabilities, ObservationSnapshot, RuntimeCheckpoint } from './types.js';

export interface IBrowserAdapter {
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
    restoreCheckpoint(sessionId: string, checkpoint: RuntimeCheckpoint): Promise<void>;
    setCrashHandler?(handler: () => void): void;
}
