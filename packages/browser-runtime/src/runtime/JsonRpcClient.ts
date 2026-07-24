import { IBrowserRuntime, BrowserRuntimeEvent } from '../contracts/IBrowserRuntime.js';
import { RuntimeMetadata, RuntimeCapabilities, ObservationSnapshot, RuntimeCheckpoint } from '../contracts/types.js';
import { JsonRpcRequest, JsonRpcResponse, JsonRpcEvent } from './jsonRpcTypes.js';
import { RuntimeError } from './errors.js';

export class JsonRpcClient implements IBrowserRuntime {
  private sendMessage: (message: string) => void;
  private messageIdCounter: number = 1;
  private pendingRequests: Map<string | number, { resolve: (val: any) => void, reject: (err: any) => void }> = new Map();
  private listeners: Map<string, Set<(event: BrowserRuntimeEvent) => void>> = new Map();

  constructor(sendMessage: (message: string) => void) {
    this.sendMessage = sendMessage;
  }

  public handleMessage(message: string): void {
    const payload = JSON.parse(message);
    
    if (payload.method && !payload.id) { // It's an event
      const event = payload as JsonRpcEvent;
      const eventListeners = this.listeners.get(event.method);
      if (eventListeners) {
        eventListeners.forEach(listener => listener({ type: event.method as any, payload: event.params }));
      }
    } else if (payload.id !== undefined) { // It's a response
      const response = payload as JsonRpcResponse;
      const pending = this.pendingRequests.get(response.id!);
      if (pending) {
        this.pendingRequests.delete(response.id!);
        if (response.error) {
          pending.reject(new RuntimeError(response.error.message, response.error.code));
        } else {
          pending.resolve(response.result);
        }
      }
    }
  }

  private sendRequest<T>(method: string, params?: any): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = this.messageIdCounter++;
      this.pendingRequests.set(id, { resolve, reject });
      const request: JsonRpcRequest = {
        jsonrpc: '2.0',
        id,
        method,
        params
      };
      this.sendMessage(JSON.stringify(request));
    });
  }

  async getMetadata(): Promise<RuntimeMetadata> {
    return this.sendRequest('Runtime.getMetadata');
  }

  async getCapabilities(): Promise<RuntimeCapabilities> {
    return this.sendRequest('Runtime.getCapabilities');
  }

  async createSession(): Promise<string> {
    const result: any = await this.sendRequest('Session.create');
    return result.sessionId;
  }

  async closeSession(sessionId: string): Promise<void> {
    await this.sendRequest('Session.destroy', { sessionId });
  }

  async navigate(sessionId: string, url: string): Promise<void> {
    await this.sendRequest('Navigation.open', { sessionId, url });
  }

  async capture(sessionId: string, levels: (number | string)[]): Promise<ObservationSnapshot> {
    return this.sendRequest('Observation.capture', { sessionId, levels });
  }

  async click(sessionId: string, nodeId: string, modifiers?: string[]): Promise<void> {
    await this.sendRequest('Interaction.click', { sessionId, nodeId, modifiers });
  }

  async type(sessionId: string, nodeId: string, text: string, delay?: number): Promise<void> {
    await this.sendRequest('Interaction.type', { sessionId, nodeId, text, delay });
  }

  async scroll(sessionId: string, distanceY: number, behavior?: string): Promise<void> {
    await this.sendRequest('Viewport.scroll', { sessionId, distanceY, behavior });
  }

  async createCheckpoint(sessionId: string): Promise<RuntimeCheckpoint> {
    // Note: Not strictly in the protocol spec yet, but needed for the interface
    return this.sendRequest('Session.createCheckpoint', { sessionId });
  }

  async restoreCheckpoint(sessionId: string, checkpoint: RuntimeCheckpoint, options?: { soft?: boolean }): Promise<void> {
    await this.sendRequest('Session.restoreCheckpoint', { sessionId, checkpoint, options });
  }

  on(event: string, listener: (event: BrowserRuntimeEvent) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  off(event: string, listener: (event: BrowserRuntimeEvent) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
    }
  }
}
