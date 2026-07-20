import { SessionNotFoundError } from './errors.js';

interface SessionData {
  id: string;
  createdAt: number;
  lastActiveAt: number;
}

export class SessionManager {
  private sessions: Map<string, SessionData> = new Map();
  private ttlMs: number;
  private cleanupInterval: NodeJS.Timeout;
  private onEvict?: (sessionId: string) => Promise<void>;

  constructor(ttlMs: number = 3600000) { // Default TTL: 1 hour
    this.ttlMs = ttlMs;
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000); // Check every minute
  }

  public setEvictionHandler(handler: (sessionId: string) => Promise<void>) {
    this.onEvict = handler;
  }

  public registerSession(id: string): void {
    this.sessions.set(id, {
      id,
      createdAt: Date.now(),
      lastActiveAt: Date.now()
    });
  }

  public touchSession(id: string): void {
    const session = this.sessions.get(id);
    if (!session) {
      throw new SessionNotFoundError(`Session ${id} not found.`);
    }
    session.lastActiveAt = Date.now();
  }

  public hasSession(id: string): boolean {
    return this.sessions.has(id);
  }

  public async evictSession(id: string): Promise<void> {
    if (this.sessions.has(id)) {
      this.sessions.delete(id);
      if (this.onEvict) {
        await this.onEvict(id).catch(console.error); // Best effort
      }
    }
  }

  public getActiveSessions(): string[] {
    return Array.from(this.sessions.keys());
  }

  public async destroy(): Promise<void> {
    clearInterval(this.cleanupInterval);
    for (const id of this.sessions.keys()) {
      await this.evictSession(id);
    }
  }

  private async cleanup(): Promise<void> {
    const now = Date.now();
    for (const [id, session] of this.sessions.entries()) {
      if (now - session.lastActiveAt > this.ttlMs) {
        await this.evictSession(id);
      }
    }
  }
}
