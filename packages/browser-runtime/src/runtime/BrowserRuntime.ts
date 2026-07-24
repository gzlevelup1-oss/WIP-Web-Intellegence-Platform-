import { IBrowserRuntime, BrowserRuntimeEvent } from '../contracts/IBrowserRuntime.js';
import { IBrowserAdapter } from '../contracts/IBrowserAdapter.js';
import { SessionManager } from './SessionManager.js';
import { BrowserService } from '../services/BrowserService.js';
import { RuntimeMetadata, RuntimeCapabilities, ObservationSnapshot } from '../contracts/types.js';

export class BrowserRuntime implements IBrowserRuntime {
  private adapter: IBrowserAdapter;
  private sessionManager: SessionManager;
  private browserService: BrowserService;
  private listeners: Map<string, Set<(event: BrowserRuntimeEvent) => void>> = new Map();

  constructor(adapter: IBrowserAdapter) {
    this.adapter = adapter;
    this.sessionManager = new SessionManager();
    this.browserService = new BrowserService(adapter, this.sessionManager);

    this.sessionManager.setEvictionHandler(async (sessionId: string) => {
      await this.adapter.closeSession(sessionId);
    });

    if (typeof this.adapter.onNetworkEvent === 'function') {
      this.adapter.onNetworkEvent((sessionId, eventName, eventData) => {
        if (eventName === 'Event.Network.RequestSent') {
          this.emit({ type: 'Event.Network.RequestSent', payload: { requestId: eventData.id, url: eventData.url, method: eventData.method } });
        } else if (eventName === 'Event.Network.ResponseReceived') {
          this.emit({ type: 'Event.Network.ResponseReceived', payload: { requestId: eventData.url, status: eventData.status, mimeType: 'unknown' } });
        }
      });
    }

    if (typeof this.adapter.setCrashHandler === 'function') {
      this.adapter.setCrashHandler(() => {
        // Evict all on crash? Or how to handle?
        // Actually, PlaywrightAdapter triggers its own cleanup or we can handle it.
      });
    }
  }

  public async getMetadata(): Promise<RuntimeMetadata> {
    return await this.adapter.getMetadata();
  }

  public async getCapabilities(): Promise<RuntimeCapabilities> {
    return await this.adapter.getCapabilities();
  }

  public async createSession(): Promise<string> {
    const sessionId = await this.adapter.createSession();
    this.sessionManager.registerSession(sessionId);
    return sessionId;
  }

  public async closeSession(sessionId: string): Promise<void> {
    await this.sessionManager.evictSession(sessionId);
  }

  public async navigate(sessionId: string, url: string): Promise<void> {
    await this.browserService.navigate(sessionId, url);
  }

  public async capture(sessionId: string, levels: (number | string)[]): Promise<ObservationSnapshot> {
    return await this.browserService.capture(sessionId, levels);
  }

  public async click(sessionId: string, nodeId: string, modifiers?: string[]): Promise<void> {
    await this.browserService.click(sessionId, nodeId, modifiers);
  }

  public async type(sessionId: string, nodeId: string, text: string, delay?: number): Promise<void> {
    await this.browserService.type(sessionId, nodeId, text, delay);
  }

  public async createCheckpoint(sessionId: string) {
    return this.browserService.createCheckpoint(sessionId);
  }

  public async restoreCheckpoint(sessionId: string, checkpoint: any): Promise<void> {
    return this.browserService.restoreCheckpoint(sessionId, checkpoint);
  }

  public async scroll(sessionId: string, distanceY: number, behavior?: string): Promise<void> {
    await this.browserService.scroll(sessionId, distanceY, behavior);
  }

  public on(event: string, listener: (event: BrowserRuntimeEvent) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  public off(event: string, listener: (event: BrowserRuntimeEvent) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
    }
  }

  private emit(event: BrowserRuntimeEvent): void {
    const eventListeners = this.listeners.get(event.type);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(event));
    }
  }

  public getInternalAdapter(): IBrowserAdapter {
    return this.adapter;
  }
}
