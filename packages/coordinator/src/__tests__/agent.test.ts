import { describe, it, expect, vi } from 'vitest';
import { CoordinatorAgent } from '../agent.js';
import { IExecutionKernelAdapter, IWorkerAdapter } from '../adapter.js';

// Mock genai
vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      chats = {
        create: vi.fn().mockImplementation((config) => {
          return {
            sendMessage: vi.fn().mockImplementation(async () => {
              const callable = config.config.tools[0];
              const calls = [
                {
                  id: 'call-1',
                  name: 'Observation_capture',
                  args: { levels: ['DOM', 'A11Y'] }
                },
                {
                  id: 'call-2',
                  name: 'Mission_complete',
                  args: { resultPayload: 'done' }
                }
              ];
              if (callable && callable.callTool) {
                await callable.callTool(calls);
              }
              return { text: 'I will complete the mission.' };
            })
          };
        })
      };
    }
  };
});

describe('CoordinatorAgent', () => {
  it('should run loop and handle tool calls', async () => {
    const mockKernel: IExecutionKernelAdapter = {
      captureObservation: vi.fn(),
      click: vi.fn(),
      type: vi.fn(),
      goto: vi.fn()
    };
    
    const mockWorkers: IWorkerAdapter = {
      extractDesignTokens: vi.fn(),
      mineComponents: vi.fn(),
      analyzeLayout: vi.fn()
    };
    
    const agent = new CoordinatorAgent('fake-api-key', mockKernel, mockWorkers);
    
    const result = await agent.start('test objective');
    
    expect(mockKernel.captureObservation).toHaveBeenCalledWith(['DOM', 'A11Y']);
    expect(result.status).toBe('completed');
    expect(result.payload).toBe('done');
  });
});
