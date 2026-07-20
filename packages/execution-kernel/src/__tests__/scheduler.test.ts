import { describe, it, expect, vi } from 'vitest';
import { Scheduler } from '../scheduler.js';

describe('Scheduler', () => {
  it('should execute action successfully on first attempt', async () => {
    const scheduler = new Scheduler();
    const actionFn = vi.fn().mockResolvedValue({ success: true, data: 'ok' });
    
    const result = await scheduler.executeWithRetry(actionFn);
    expect(result.success).toBe(true);
    expect(result.data).toBe('ok');
    expect(actionFn).toHaveBeenCalledTimes(1);
  });

  it('should retry and succeed on subsequent attempt', async () => {
    const scheduler = new Scheduler();
    const actionFn = vi.fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockResolvedValueOnce({ success: true, data: 'ok' });
    
    const result = await scheduler.executeWithRetry(actionFn, 3, 10);
    expect(result.success).toBe(true);
    expect(result.data).toBe('ok');
    expect(actionFn).toHaveBeenCalledTimes(2);
  });

  it('should return failure after max retries', async () => {
    const scheduler = new Scheduler();
    const actionFn = vi.fn().mockRejectedValue(new Error('always fail'));
    
    const result = await scheduler.executeWithRetry(actionFn, 3, 10);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Failed after 3 attempts/);
    expect(actionFn).toHaveBeenCalledTimes(3);
  });
});
