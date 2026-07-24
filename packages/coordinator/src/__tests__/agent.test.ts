import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CoordinatorAgent } from '../agent.js';

// Define it out here so it's hoisted? Actually let's just not rely on a hoisted variable.

// Mock the GoogleGenAI module
vi.mock('@google/genai', () => {
    // We can't access outer scope easily in vi.mock without doing some tricks.
    // Instead we can just attach it to globalThis if we need to track it, but we actually 
    // only need to clear it between tests. 
    // Better yet, let's just make it a fresh agent instance and we can inspect the last call directly on the agent instance.
    return {
        Type: { OBJECT: 'OBJECT', STRING: 'STRING', ARRAY: 'ARRAY' },
        GoogleGenAI: class {
            chats = {
                create: vi.fn().mockImplementation((config) => {
                    return {
                        sendMessage: vi.fn().mockResolvedValue({ text: 'mocked response' }),
                        config
                    };
                })
            };
        }
    };
});

describe('CoordinatorAgent - Dynamic Capability Pruning', () => {
    it('should inject full tools when capabilities are true', async () => {
        const kernelMock = {
            getCapabilities: async () => ({
                'Navigation': true,
                'Interaction': true,
                'Observation': true,
                'ScriptExecution': true
            }),
            captureObservation: vi.fn(),
            click: vi.fn(),
            type: vi.fn(),
            goto: vi.fn()
        };
        
        const agent = new CoordinatorAgent('fake-key', kernelMock, {} as any, {} as any);
        await agent.start('test');
        
        const createCall = (agent as any).ai.chats.create.mock.calls[0][0];
        
        const systemPrompt = createCall.config.systemInstruction;
        expect(systemPrompt).toContain('Navigation": true');
        expect(systemPrompt).toContain('Interaction": true');
        
        const callableTool = createCall.config.tools[0];
        const declarations = await callableTool.tool();
        
        expect(declarations.functionDeclarations.some((d: any) => d.name === 'Interaction_click')).toBe(true);
        expect(declarations.functionDeclarations.some((d: any) => d.name === 'Navigation_goto')).toBe(true);
    });

    it('should prune Interaction tools when Interaction capability is missing', async () => {
        const kernelMock = {
            getCapabilities: async () => ({
                'Navigation': true,
                'Interaction': false, // NO INTERACTION
                'Observation': true,
                'ScriptExecution': true
            }),
            captureObservation: vi.fn(),
            click: vi.fn(),
            type: vi.fn(),
            goto: vi.fn()
        };
        
        const agent = new CoordinatorAgent('fake-key', kernelMock, {} as any, {} as any);
        await agent.start('test');
        
        const createCall = (agent as any).ai.chats.create.mock.calls[0][0];
        
        const systemPrompt = createCall.config.systemInstruction;
        expect(systemPrompt).toContain('Interaction": false');
        
        const callableTool = createCall.config.tools[0];
        const declarations = await callableTool.tool();
        
        expect(declarations.functionDeclarations.some((d: any) => d.name === 'Interaction_click')).toBe(false); // PRUNED
        expect(declarations.functionDeclarations.some((d: any) => d.name === 'Interaction_type')).toBe(false); // PRUNED
        expect(declarations.functionDeclarations.some((d: any) => d.name === 'Navigation_goto')).toBe(true); // KEPT
    });

    it('should prune Validation_evaluate when ScriptExecution is missing', async () => {
        const kernelMock = {
            getCapabilities: async () => ({
                'Navigation': true,
                'Interaction': true,
                'Observation': true,
                'ScriptExecution': false
            }),
            captureObservation: vi.fn(),
            click: vi.fn(),
            type: vi.fn(),
            goto: vi.fn()
        };
        
        const agent = new CoordinatorAgent('fake-key', kernelMock, {} as any, {} as any);
        await agent.start('test');
        
        const createCall = (agent as any).ai.chats.create.mock.calls[0][0];
        const callableTool = createCall.config.tools[0];
        const declarations = await callableTool.tool();
        
        expect(declarations.functionDeclarations.some((d: any) => d.name === 'Validation_evaluate')).toBe(false);
    });
});
