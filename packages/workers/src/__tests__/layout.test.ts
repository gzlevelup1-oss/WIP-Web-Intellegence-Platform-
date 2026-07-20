import { describe, it, expect } from 'vitest';
import { LayoutAnalyzer } from '../layout.js';
import { ObservationGraph } from '../types.js';

describe('LayoutAnalyzer', () => {
  it('should identify a Row layout', () => {
    const graph: ObservationGraph = {
      snapshot: {},
      nodes: [
        { id: 'container', type: 'DOMNode', properties: {} },
        { id: 'c1', type: 'DOMNode', properties: {} },
        { id: 'g1', type: 'GeometryNode', properties: { x: 0, y: 10, width: 50, height: 20 } },
        { id: 'c2', type: 'DOMNode', properties: {} },
        { id: 'g2', type: 'GeometryNode', properties: { x: 60, y: 10, width: 50, height: 20 } }
      ],
      edges: [
        { source: 'c1', target: 'container', type: 'CHILD_OF' },
        { source: 'c2', target: 'container', type: 'CHILD_OF' },
        { source: 'c1', target: 'g1', type: 'HAS_GEOMETRY' },
        { source: 'c2', target: 'g2', type: 'HAS_GEOMETRY' }
      ]
    };

    const analyzer = new LayoutAnalyzer();
    const result = analyzer.analyze(graph, 'container');
    
    expect(result.layoutType).toBe('Row');
    expect(result.alignment).toBe('center-y');
    expect(result.gap).toBe(10);
  });
  
  it('should identify a Column layout', () => {
    const graph: ObservationGraph = {
      snapshot: {},
      nodes: [
        { id: 'container', type: 'DOMNode', properties: {} },
        { id: 'c1', type: 'DOMNode', properties: {} },
        { id: 'g1', type: 'GeometryNode', properties: { x: 10, y: 0, width: 100, height: 30 } },
        { id: 'c2', type: 'DOMNode', properties: {} },
        { id: 'g2', type: 'GeometryNode', properties: { x: 10, y: 40, width: 100, height: 30 } }
      ],
      edges: [
        { source: 'c1', target: 'container', type: 'CHILD_OF' },
        { source: 'c2', target: 'container', type: 'CHILD_OF' },
        { source: 'c1', target: 'g1', type: 'HAS_GEOMETRY' },
        { source: 'c2', target: 'g2', type: 'HAS_GEOMETRY' }
      ]
    };

    const analyzer = new LayoutAnalyzer();
    const result = analyzer.analyze(graph, 'container');
    
    expect(result.layoutType).toBe('Column');
    expect(result.alignment).toBe('center-x');
    expect(result.gap).toBe(10);
  });
});
