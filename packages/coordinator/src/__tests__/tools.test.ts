import { describe, it, expect } from 'vitest';
import { CoordinatorToolDeclarations } from '../tools.js';

describe('CoordinatorTools', () => {
  it('should export tool declarations', () => {
    expect(CoordinatorToolDeclarations).toBeDefined();
    expect(Array.isArray(CoordinatorToolDeclarations)).toBe(true);
    expect(CoordinatorToolDeclarations.length).toBeGreaterThan(0);
    
    // Check that we have our important tools
    const tools = CoordinatorToolDeclarations[0].functionDeclarations;
    expect(tools).toBeDefined();
    expect(tools!.some((t: any) => t.name === 'Mission_complete')).toBe(true);
  });
});
