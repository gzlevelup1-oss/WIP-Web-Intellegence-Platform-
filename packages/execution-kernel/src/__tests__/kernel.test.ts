import { describe, it, expect, vi } from 'vitest';
import { ExecutionKernel } from '../kernel.js';
import { ICheckpointAdapter } from '../checkpoint.js';

describe('ExecutionKernel', () => {
  const mockAdapter: ICheckpointAdapter = {
    createCheckpoint: vi.fn().mockResolvedValue({ url: 'http://test.com', cookies: [] }),
    restoreCheckpoint: vi.fn().mockResolvedValue(undefined)
  };

  it('should begin and commit transaction', async () => {
    const kernel = new ExecutionKernel(mockAdapter);
    
    const tx = await kernel.beginTransaction('m1', 's1');
    expect(tx.status).toBe('ACTIVE');
    expect(mockAdapter.createCheckpoint).toHaveBeenCalledWith('s1');
    
    const actionResult = await kernel.executeAction(tx, async () => ({ success: true, data: 'ok' }));
    expect(actionResult.success).toBe(true);
    expect(actionResult.data).toBe('ok');
    
    await kernel.commitTransaction(tx);
    expect(tx.status).toBe('COMMITTED');
  });

  it('should prevent action on inactive transaction', async () => {
    const kernel = new ExecutionKernel(mockAdapter);
    
    const tx = await kernel.beginTransaction('m1', 's2');
    
    await kernel.abortTransaction(tx, true);
    
    const actionResult = await kernel.executeAction(tx, async () => ({ success: true }));
    expect(actionResult.success).toBe(false);
    expect(actionResult.error).toMatch(/not active/);
  });
});
