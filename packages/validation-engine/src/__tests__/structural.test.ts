import { describe, it, expect } from 'vitest';
import { structuralDiff } from '../structural.js';

describe('structuralDiff', () => {
  it('should return empty violations for identical graphs', () => {
    const graph1 = { 
      nodes: [
        { id: '1', type: 'DOMNode', properties: { tagName: 'div' } },
        { id: '2', type: 'DOMNode', properties: { tagName: 'span' } }
      ],
      edges: [
        { source: '2', target: '1', type: 'CHILD_OF' }
      ]
    };
    const graph2 = { 
      nodes: [
        { id: '1', type: 'DOMNode', properties: { tagName: 'div' } },
        { id: '2', type: 'DOMNode', properties: { tagName: 'span' } }
      ],
      edges: [
        { source: '2', target: '1', type: 'CHILD_OF' }
      ]
    };
    
    const violations = structuralDiff(graph1, graph2);
    expect(violations.length).toBe(0);
  });

  it('should report violation for large structural mismatch', () => {
    const graph1 = { 
      nodes: [
        { id: '1', type: 'DOMNode', properties: { tagName: 'div' } },
        { id: '2', type: 'DOMNode', properties: { tagName: 'span' } }
      ],
      edges: [
        { source: '2', target: '1', type: 'CHILD_OF' }
      ]
    };
    const graph2 = { 
      nodes: [
        { id: '1', type: 'DOMNode', properties: { tagName: 'div' } },
        { id: '3', type: 'DOMNode', properties: { tagName: 'p' } },
        { id: '4', type: 'DOMNode', properties: { tagName: 'a' } },
        { id: '5', type: 'DOMNode', properties: { tagName: 'button' } }
      ],
      edges: [
        { source: '3', target: '1', type: 'CHILD_OF' },
        { source: '4', target: '3', type: 'CHILD_OF' },
        { source: '5', target: '4', type: 'CHILD_OF' }
      ]
    };
    
    const violations = structuralDiff(graph1, graph2);
    expect(violations.length).toBeGreaterThan(0);
    expect(violations[0].type).toBe('Structural');
  });
});
