import { describe, it, expect, vi } from 'vitest';
import { CheckpointManager } from '../checkpoint.js';
import { BrowserContext, Page } from 'playwright';

describe('CheckpointManager', () => {
  it('should create checkpoint successfully', async () => {
    const manager = new CheckpointManager();
    const mockContext = {
      cookies: vi.fn().mockResolvedValue([{ name: 'test', value: '123' }])
    } as unknown as BrowserContext;
    const mockPage = {
      url: vi.fn().mockReturnValue('http://test.com')
    } as unknown as Page;

    const checkpoint = await manager.createCheckpoint(mockContext, mockPage);
    expect(checkpoint.url).toBe('http://test.com');
    expect(checkpoint.cookies).toEqual([{ name: 'test', value: '123' }]);
  });

  it('should restore checkpoint successfully', async () => {
    const manager = new CheckpointManager();
    const mockContext = {
      clearCookies: vi.fn().mockResolvedValue(undefined),
      addCookies: vi.fn().mockResolvedValue(undefined)
    } as unknown as BrowserContext;
    const mockPage = {
      url: vi.fn().mockReturnValue('http://other.com'),
      goto: vi.fn().mockResolvedValue(undefined)
    } as unknown as Page;

    const checkpoint = { url: 'http://test.com', cookies: [{ name: 'test', value: '123' }] };
    await manager.restoreCheckpoint(mockContext, mockPage, checkpoint);

    expect(mockContext.clearCookies).toHaveBeenCalled();
    expect(mockContext.addCookies).toHaveBeenCalledWith(checkpoint.cookies);
    expect(mockPage.goto).toHaveBeenCalledWith('http://test.com', { waitUntil: 'networkidle' });
  });

  it('should not navigate if URL is the same on restore', async () => {
    const manager = new CheckpointManager();
    const mockContext = {
      clearCookies: vi.fn().mockResolvedValue(undefined),
      addCookies: vi.fn().mockResolvedValue(undefined)
    } as unknown as BrowserContext;
    const mockPage = {
      url: vi.fn().mockReturnValue('http://test.com'),
      goto: vi.fn()
    } as unknown as Page;

    const checkpoint = { url: 'http://test.com', cookies: [] };
    await manager.restoreCheckpoint(mockContext, mockPage, checkpoint);

    expect(mockPage.goto).not.toHaveBeenCalled();
  });
});
