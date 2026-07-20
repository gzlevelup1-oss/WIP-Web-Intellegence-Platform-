import { describe, it, expect } from 'vitest';
import { structuralDiff } from '../structural.js';

describe('structuralDiff', () => {
  it('should return empty violations for identical graphs', () => {
    const graph1 = { nodes: [{ type: 'GeometryNode', properties: { width: 100, height: 100 } }] };
    const graph2 = { nodes: [{ type: 'GeometryNode', properties: { width: 100, height: 100 } }] };
    
    const violations = structuralDiff(graph1, graph2);
    expect(violations.length).toBe(0);
  });

  it('should report violation for large geometry mismatch', () => {
    const graph1 = { nodes: [{ type: 'GeometryNode', properties: { width: 100, height: 100 } }] };
    const graph2 = { nodes: [{ type: 'GeometryNode', properties: { width: 110, height: 100 } }] };
    
    const violations = structuralDiff(graph1, graph2);
    expect(violations.length).toBeGreaterThan(0);
    expect(violations[0].type).toBe('Visual');
  });
  
  it('should report violation for node count mismatch', () => {
    const graph1 = { nodes: Array(15).fill({ type: 'OtherNode' }) };
    const graph2 = { nodes: [] };
    
    const violations = structuralDiff(graph1, graph2);
    expect(violations.length).toBeGreaterThan(0);
    expect(violations[0].type).toBe('Structural');
  });
});
