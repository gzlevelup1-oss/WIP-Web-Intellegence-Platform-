import { describe, it, expect, vi } from 'vitest';
import { ExecutionKernel } from '../kernel.js';
import { Task } from '../task.js';
import { BrowserAction, ActionResult } from '../types.js';
import { ICapabilityAdapter } from '../capabilities.js';

describe('ExecutionKernel - Capability Validation', () => {
    it('should allow execution if capabilities are supported', async () => {
        const capabilityAdapter: ICapabilityAdapter = {
            getCapabilities: async () => ({
                'Navigation': true,
                'Interaction': true
            })
        };
        const kernel = new ExecutionKernel({ capabilityAdapter });
        
        const tx = await kernel.beginTransaction('m-test', 'session-1', 'admin');
        const task = new Task([{ type: 'navigate', payload: 'http://test.com' }, { type: 'click', payload: 'node1' }]);
        
        const result = await kernel.executeTask(tx, task, async (action) => ({ success: true }));
        expect(result.success).toBe(true);
    });

    it('should reject execution if a capability is missing', async () => {
        const capabilityAdapter: ICapabilityAdapter = {
            getCapabilities: async () => ({
                'Navigation': true,
                'Interaction': false // Interaction not supported
            })
        };
        const kernel = new ExecutionKernel({ capabilityAdapter });
        
        const tx = await kernel.beginTransaction('m-test', 'session-2', 'admin');
        const task = new Task([{ type: 'click', payload: 'node1' }]);
        
        const result = await kernel.executeTask(tx, task, async (action) => ({ success: true }));
        expect(result.success).toBe(false);
        expect(result.error).toContain('Runtime does not support required capability: Interaction');
    });

    it('should fallback to old behavior if no capabilityAdapter is provided', async () => {
        const kernel = new ExecutionKernel();
        const tx = await kernel.beginTransaction('m-test', 'session-3', 'admin');
        const task = new Task([{ type: 'click', payload: 'node1' }]);
        
        const result = await kernel.executeTask(tx, task, async (action) => ({ success: true }));
        expect(result.success).toBe(true);
    });
});
