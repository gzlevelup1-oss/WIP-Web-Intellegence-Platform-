import { describe, it, expect, vi } from 'vitest';
import { ExecutionKernel } from '../kernel.js';
import { ICheckpointAdapter } from '../checkpoint.js';
import { Task } from '../task.js';

describe('ExecutionKernel', () => {
  const mockAdapter: ICheckpointAdapter = {
    createCheckpoint: vi.fn().mockResolvedValue({ url: 'http://test.com', cookies: [] }),
    restoreCheckpoint: vi.fn().mockResolvedValue(undefined)
  };

  it('should begin and commit transaction with task execution', async () => {
    const kernel = new ExecutionKernel(mockAdapter);
    
    const tx = await kernel.beginTransaction('m1', 's1', 'admin');
    expect(tx.status).toBe('ACTIVE');
    expect(mockAdapter.createCheckpoint).toHaveBeenCalledWith('s1');
    
    const task = new Task([{ type: 'navigate', payload: 'http://test.com' }]);
    const actionResult = await kernel.executeTask(tx, task, async () => ({ success: true, data: 'ok' }));
    
    expect(actionResult.success).toBe(true);
    expect(actionResult.data).toBe('ok');
    
    await kernel.commitTransaction(tx);
    expect(tx.status).toBe('COMMITTED');
    expect(tx.tasks.length).toBe(1);
  });

  it('should reject task if policy violates', async () => {
    const kernel = new ExecutionKernel(mockAdapter);
    
    const tx = await kernel.beginTransaction('m2', 's2', 'user'); // user cannot navigate
    const task = new Task([{ type: 'navigate', payload: 'http://test.com' }]);
    const actionResult = await kernel.executeTask(tx, task, async () => ({ success: true, data: 'ok' }));
    
    expect(actionResult.success).toBe(false);
    expect(actionResult.error).toMatch(/RBAC Policy Violation/);
    
    await kernel.abortTransaction(tx, true);
  });

  it('should prevent action on inactive transaction', async () => {
    const kernel = new ExecutionKernel(mockAdapter);
    
    const tx = await kernel.beginTransaction('m1', 's3', 'admin');
    
    await kernel.abortTransaction(tx, true);
    
    const task = new Task([]);
    const actionResult = await kernel.executeTask(tx, task, async () => ({ success: true }));
    expect(actionResult.success).toBe(false);
    expect(actionResult.error).toMatch(/not active/);
  });
});
