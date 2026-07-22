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

  it('should report violation for 6% structural mismatch (over 5% threshold)', () => {
    const graph1 = { nodes: [], edges: [] } as { nodes: any[], edges: any[] };
    const graph2 = { nodes: [], edges: [] } as { nodes: any[], edges: any[] };

    for (let i = 1; i <= 20; i++) {
      graph1.nodes.push({ id: String(i), type: 'DOMNode', properties: { tagName: 'div' } });
      graph2.nodes.push({ id: String(i), type: 'DOMNode', properties: { tagName: 'div' } });
      if (i > 1) {
        graph1.edges.push({ source: String(i), target: '1', type: 'CHILD_OF' });
        graph2.edges.push({ source: String(i), target: '1', type: 'CHILD_OF' });
      }
    }

    graph2.nodes[10].properties.tagName = 'span';
    graph2.nodes[11].properties.tagName = 'p';
    graph2.nodes[12].properties.tagName = 'a';

    const violations = structuralDiff(graph1, graph2);
    expect(violations.length).toBeGreaterThan(0);
    expect(violations[0].message).toContain('exceeded threshold');
  });
});
