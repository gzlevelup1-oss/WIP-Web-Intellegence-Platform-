import { EventEmitter } from 'events';
import { IBrowserAdapter } from '../contracts/IBrowserAdapter.js';
import { SessionManager } from '../runtime/SessionManager.js';
import { ObservationSnapshot } from '../contracts/types.js';

export class BrowserService extends EventEmitter {
  private adapter: IBrowserAdapter;
  private sessionManager: SessionManager;

  constructor(adapter: IBrowserAdapter, sessionManager: SessionManager) {
    super();
    this.adapter = adapter;
    this.sessionManager = sessionManager;
    if (this.adapter.onNetworkEvent) {
      this.adapter.onNetworkEvent((sessionId, eventName, eventData) => {
        this.emit('networkEvent', { sessionId, eventName, eventData });
        this.emit(eventName, { sessionId, ...eventData });
      });
    }
  }

  public async navigate(sessionId: string, url: string): Promise<void> {
    this.sessionManager.touchSession(sessionId);
    await this.adapter.navigate(sessionId, url);
  }

  public async capture(sessionId: string, levels: (number | string)[]): Promise<ObservationSnapshot> {
    this.sessionManager.touchSession(sessionId);
    return await this.adapter.capture(sessionId, levels);
  }

  public async click(sessionId: string, nodeId: string, modifiers?: string[]): Promise<void> {
    this.sessionManager.touchSession(sessionId);
    await this.adapter.click(sessionId, nodeId, modifiers);
  }

  public async type(sessionId: string, nodeId: string, text: string, delay?: number): Promise<void> {
    this.sessionManager.touchSession(sessionId);
    await this.adapter.type(sessionId, nodeId, text, delay);
  }

  public async createCheckpoint(sessionId: string) {
    this.sessionManager.touchSession(sessionId);
    return await this.adapter.createCheckpoint(sessionId);
  }

  public async restoreCheckpoint(sessionId: string, checkpoint: any): Promise<void> {
    this.sessionManager.touchSession(sessionId);
    await this.adapter.restoreCheckpoint(sessionId, checkpoint);
  }

  public async scroll(sessionId: string, distanceY: number, behavior?: string): Promise<void> {
    this.sessionManager.touchSession(sessionId);
    await this.adapter.scroll(sessionId, distanceY, behavior);
  }
}
