import { describe, it, expect, vi } from 'vitest';
import { BrowserRuntime } from '../runtime/BrowserRuntime.js';
import { IBrowserAdapter } from '../contracts/IBrowserAdapter.js';
import { RuntimeMetadata, RuntimeCapabilities, ObservationSnapshot } from '../contracts/types.js';

class MockAdapter implements IBrowserAdapter {
  async getMetadata(): Promise<RuntimeMetadata> { return { name: 'm', version: '1', backend: 'm', platform: 'test', viewport: { width: 800, height: 600 }, locale: 'en-US', timezone: 'UTC', userAgent: 'test' }; }
  async getCapabilities(): Promise<RuntimeCapabilities> { return { canClick: true, canType: true, canScroll: true, canCapture: true }; }
  async createSession(): Promise<string> { return 's1'; }
  async closeSession(id: string): Promise<void> {}
  async navigate(id: string, url: string): Promise<void> {}
  async capture(id: string, levels: number[]): Promise<ObservationSnapshot> { return {} as any; }
  async click(id: string, n: string, modifiers?: string[]): Promise<void> {}
  async type(id: string, n: string, text: string, delay?: number): Promise<void> {}
  async scroll(id: string, dy: number, behavior?: string): Promise<void> {}
  async createCheckpoint(id: string): Promise<any> { return { url: 'u', cookies: [] }; }
  async restoreCheckpoint(id: string, c: any): Promise<void> {}
}

describe('BrowserRuntime', () => {
  it('orchestrates all methods', async () => {
    const adapter = new MockAdapter();
    const runtime = new BrowserRuntime(adapter);
    
    const meta = await runtime.getMetadata();
    expect(meta.name).toBe('m');

    const caps = await runtime.getCapabilities();
    expect(caps.canClick).toBe(true);
    
    const id = await runtime.createSession();
    expect(id).toBe('s1');
    
    const navSpy = vi.spyOn(adapter, 'navigate');
    await runtime.navigate(id, 'http://test.com');
    expect(navSpy).toHaveBeenCalledWith('s1', 'http://test.com');

    const capSpy = vi.spyOn(adapter, 'capture');
    await runtime.capture(id, [1]);
    expect(capSpy).toHaveBeenCalledWith('s1', [1]);

    const clickSpy = vi.spyOn(adapter, 'click');
    await runtime.click(id, 'n1', ['Shift']);
    expect(clickSpy).toHaveBeenCalledWith('s1', 'n1', ['Shift']);

    const typeSpy = vi.spyOn(adapter, 'type');
    await runtime.type(id, 'n1', 'hello', 10);
    expect(typeSpy).toHaveBeenCalledWith('s1', 'n1', 'hello', 10);

    const scrollSpy = vi.spyOn(adapter, 'scroll');
    await runtime.scroll(id, 100, 'smooth');
    expect(scrollSpy).toHaveBeenCalledWith('s1', 100, 'smooth');
    
    const closeSpy = vi.spyOn(adapter, 'closeSession');
    const createCheckSpy = vi.spyOn(adapter, 'createCheckpoint');
    await runtime.createCheckpoint(id);
    expect(createCheckSpy).toHaveBeenCalledWith('s1');
    const restCheckSpy = vi.spyOn(adapter, 'restoreCheckpoint');
    await runtime.restoreCheckpoint(id, { url: 'u', cookies: [] });
    expect(restCheckSpy).toHaveBeenCalledWith('s1', { url: 'u', cookies: [] });
    await runtime.closeSession(id);
    expect(closeSpy).toHaveBeenCalledWith('s1');
    
    await (runtime as any).sessionManager.destroy();
  });
});
