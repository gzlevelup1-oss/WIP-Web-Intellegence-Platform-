import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SessionManager } from '../runtime/SessionManager.js';
import { SessionNotFoundError } from '../runtime/errors.js';

describe('SessionManager', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('registers and looks up sessions', () => {
    const sm = new SessionManager();
    sm.registerSession('session-1');
    expect(sm.hasSession('session-1')).toBe(true);
    sm.destroy();
  });

  it('cleans up isolated session IDs on eviction', async () => {
    const sm = new SessionManager();
    let evictedId = '';
    sm.setEvictionHandler(async (id) => { evictedId = id; });
    
    sm.registerSession('session-1');
    await sm.evictSession('session-1');
    
    expect(evictedId).toBe('session-1');
    expect(sm.hasSession('session-1')).toBe(false);
    sm.destroy();
  });

  it('throws when touching a non-existent session', () => {
    const sm = new SessionManager();
    expect(() => sm.touchSession('nope')).toThrow(SessionNotFoundError);
    sm.destroy();
  });

  it('automatically evicts sessions after TTL', async () => {
    const sm = new SessionManager(5000); // 5 sec ttl
    sm.registerSession('s1');
    expect(sm.hasSession('s1')).toBe(true);
    
    // advance 6 seconds
    await vi.advanceTimersByTimeAsync(60000); // 60s (interval is 60s)
    
    expect(sm.hasSession('s1')).toBe(false);
    sm.destroy();
  });
});
