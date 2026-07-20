import { describe, it, expect, vi } from 'vitest';
import { ExecutionKernel } from '../kernel.js';
import { BrowserContext, Page } from 'playwright';

describe('ExecutionKernel', () => {
  it('should begin and commit transaction', async () => {
    const kernel = new ExecutionKernel();
    // Register mock session
    const mockContext = { cookies: vi.fn().mockResolvedValue([]) } as unknown as BrowserContext;
    const mockPage = { url: vi.fn().mockReturnValue('http://test.com'), goto: vi.fn() } as unknown as Page;
    
    kernel.registerSession('s1', mockContext, mockPage);
    
    const tx = await kernel.beginTransaction('m1', 's1');
    expect(tx.status).toBe('ACTIVE');
    
    const actionResult = await kernel.executeAction(tx, async () => ({ success: true, data: 'ok' }));
    expect(actionResult.success).toBe(true);
    expect(actionResult.data).toBe('ok');
    
    await kernel.commitTransaction(tx);
    expect(tx.status).toBe('COMMITTED');
  });

  it('should prevent action on inactive transaction', async () => {
    const kernel = new ExecutionKernel();
    
    // Register mock session so aborting doesn't fail
    const mockContext = { cookies: vi.fn().mockResolvedValue([]) } as unknown as BrowserContext;
    const mockPage = { url: vi.fn().mockReturnValue('http://test.com'), goto: vi.fn() } as unknown as Page;
    kernel.registerSession('s2', mockContext, mockPage);
    
    const tx = await kernel.beginTransaction('m1', 's2');
    
    await kernel.abortTransaction(tx, true);
    
    const actionResult = await kernel.executeAction(tx, async () => ({ success: true }));
    expect(actionResult.success).toBe(false);
    expect(actionResult.error).toMatch(/not active/);
  });
});
