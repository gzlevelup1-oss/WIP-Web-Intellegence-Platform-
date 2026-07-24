import { describe, it, expect, vi } from 'vitest';
import { BrowserService } from '../services/BrowserService.js';
import { SessionManager } from '../runtime/SessionManager.js';
import { IBrowserAdapter } from '../contracts/IBrowserAdapter.js';
import { RuntimeMetadata, RuntimeCapabilities, ObservationSnapshot } from '../contracts/types.js';

class MockAdapter implements IBrowserAdapter {
  async getMetadata(): Promise<RuntimeMetadata> { return { runtimeId: 'test-rt', browserVersion: '1.0', protocolVersion: '1.0', platform: 'test', viewport: { width: 800, height: 600 }, locale: 'en-US', timezone: 'UTC', userAgent: 'test' }; }
  async getCapabilities(): Promise<RuntimeCapabilities> { return { capabilities: { Navigation: true, Accessibility: true } }; }
  async createSession(): Promise<string> { return 's1'; }
  async closeSession(id: string): Promise<void> {}
  async navigate(id: string, url: string): Promise<void> {}
  async capture(id: string, levels: (number | string)[]): Promise<ObservationSnapshot> { return {} as ObservationSnapshot; }
  async click(id: string, n: string, modifiers?: string[]): Promise<void> {}
  async type(id: string, n: string, text: string, delay?: number): Promise<void> {}
  async scroll(id: string, dy: number, behavior?: string): Promise<void> {}
  async createCheckpoint(id: string): Promise<any> { return { url: 'u', cookies: [] }; }
  async restoreCheckpoint(id: string, c: any): Promise<void> {}
}

describe('BrowserService', () => {
  it('dispatches all interaction methods and touches session', async () => {
    const adapter = new MockAdapter();
    const sm = new SessionManager();
    sm.registerSession('s1');
    const svc = new BrowserService(adapter, sm);
    
    const touchSpy = vi.spyOn(sm, 'touchSession');
    
    const navSpy = vi.spyOn(adapter, 'navigate');
    await svc.navigate('s1', 'http://a.com');
    expect(touchSpy).toHaveBeenCalledWith('s1');
    expect(navSpy).toHaveBeenCalledWith('s1', 'http://a.com');

    const captureSpy = vi.spyOn(adapter, 'capture');
    await svc.capture('s1', [0]);
    expect(touchSpy).toHaveBeenCalledWith('s1');
    expect(captureSpy).toHaveBeenCalledWith('s1', [0]);

    const clickSpy = vi.spyOn(adapter, 'click');
    await svc.click('s1', 'n1', ['Shift']);
    expect(touchSpy).toHaveBeenCalledWith('s1');
    expect(clickSpy).toHaveBeenCalledWith('s1', 'n1', ['Shift']);

    const typeSpy = vi.spyOn(adapter, 'type');
    await svc.type('s1', 'n1', 'hello', 10);
    expect(touchSpy).toHaveBeenCalledWith('s1');
    expect(typeSpy).toHaveBeenCalledWith('s1', 'n1', 'hello', 10);

    const scrollSpy = vi.spyOn(adapter, 'scroll');
    await svc.scroll('s1', 100, 'smooth');
    expect(touchSpy).toHaveBeenCalledWith('s1');
    expect(scrollSpy).toHaveBeenCalledWith('s1', 100, 'smooth');

    const createCheckSpy = vi.spyOn(adapter, 'createCheckpoint');
    await svc.createCheckpoint('s1');
    expect(touchSpy).toHaveBeenCalledWith('s1');
    expect(createCheckSpy).toHaveBeenCalledWith('s1');
    
    const restCheckSpy = vi.spyOn(adapter, 'restoreCheckpoint');
    await svc.restoreCheckpoint('s1', { url: 'u', cookies: [] });
    expect(touchSpy).toHaveBeenCalledWith('s1');
    expect(restCheckSpy).toHaveBeenCalledWith('s1', { url: 'u', cookies: [] });
    
    sm.destroy();
  });
});
