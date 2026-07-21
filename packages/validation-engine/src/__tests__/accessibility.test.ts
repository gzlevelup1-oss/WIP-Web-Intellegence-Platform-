import { describe, it, expect } from 'vitest';
import { accessibilityDiff } from '../accessibility.js';

describe('accessibilityDiff', () => {
  it('should return empty violations for identical accessibility structures', () => {
    const graph1 = {
      nodes: [
        { id: '1', type: 'DOMNode', properties: { tagName: 'button' } },
        { id: '2', type: 'A11yNode', properties: { role: 'button', tabIndex: 0 } }
      ],
      edges: [
        { source: '1', target: '2', type: 'HAS_A11Y' }
      ]
    };
    
    const violations = accessibilityDiff(graph1, graph1);
    expect(violations.length).toBe(0);
  });

  it('should return violation when role or tabIndex differs', () => {
    const graph1 = {
      nodes: [
        { id: '1', type: 'DOMNode', properties: { tagName: 'button' } },
        { id: '2', type: 'A11yNode', properties: { role: 'button', tabIndex: 0 } }
      ],
      edges: [
        { source: '1', target: '2', type: 'HAS_A11Y' }
      ]
    };
    const graph2 = {
      nodes: [
        { id: '1', type: 'DOMNode', properties: { tagName: 'button' } },
        { id: '2', type: 'A11yNode', properties: { role: 'link', tabIndex: -1 } }
      ],
      edges: [
        { source: '1', target: '2', type: 'HAS_A11Y' }
      ]
    };
    
    const violations = accessibilityDiff(graph1, graph2);
    expect(violations.length).toBe(1);
    expect(violations[0].type).toBe('Accessibility');
  });
});
