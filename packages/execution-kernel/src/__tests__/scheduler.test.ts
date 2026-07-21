import { describe, it, expect, vi } from 'vitest';
import { Scheduler } from '../scheduler.js';
import { Task } from '../task.js';

describe('Scheduler', () => {
  it('should execute task successfully on first attempt', async () => {
    const scheduler = new Scheduler();
    const task = new Task([{ type: 'click', payload: 'n1' }]);
    const actionExecutor = vi.fn().mockResolvedValue({ success: true, data: 'ok' });
    
    const result = await scheduler.executeTaskWithRetry(task, actionExecutor);
    expect(result.success).toBe(true);
    expect(result.data).toBe('ok');
    expect(actionExecutor).toHaveBeenCalledTimes(1);
    expect(task.status).toBe('COMPLETED');
  });

  it('should retry task and succeed on subsequent attempt', async () => {
    const scheduler = new Scheduler();
    const task = new Task([{ type: 'click', payload: 'n1' }]);
    
    const actionExecutor = vi.fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockResolvedValueOnce({ success: true, data: 'ok' });
      
    const result = await scheduler.executeTaskWithRetry(task, actionExecutor, 3, 10);
    expect(result.success).toBe(true);
    expect(result.data).toBe('ok');
    expect(actionExecutor).toHaveBeenCalledTimes(2);
    expect(task.status).toBe('COMPLETED');
  });

  it('should return failure after max retries', async () => {
    const scheduler = new Scheduler();
    const task = new Task([{ type: 'click', payload: 'n1' }]);
    const actionExecutor = vi.fn().mockRejectedValue(new Error('always fail'));
    
    const result = await scheduler.executeTaskWithRetry(task, actionExecutor, 3, 10);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Task failed after 3 attempts/);
    expect(actionExecutor).toHaveBeenCalledTimes(3);
    expect(task.status).toBe('FAILED');
  });

  it('should execute multiple actions in a task', async () => {
    const scheduler = new Scheduler();
    const task = new Task([
      { type: 'type', payload: 'n1' },
      { type: 'click', payload: 'n2' }
    ]);
    const actionExecutor = vi.fn().mockResolvedValue({ success: true, data: 'ok' });
    
    const result = await scheduler.executeTaskWithRetry(task, actionExecutor);
    expect(result.success).toBe(true);
    expect(actionExecutor).toHaveBeenCalledTimes(2);
    expect(task.status).toBe('COMPLETED');
  });
});
