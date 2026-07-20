import { describe, it, expect } from 'vitest';
import { ComponentMiner } from '../miner.js';
import { ObservationGraph } from '../types.js';

describe('ComponentMiner', () => {
  it('should identify a component root when background color changes and it has text children', () => {
    const graph: ObservationGraph = {
      snapshot: {},
      nodes: [
        { id: 'parent', type: 'DOMNode', properties: {} },
        { id: 'parentStyle', type: 'StyleNode', properties: { backgroundColor: 'rgb(255, 255, 255)' } },
        { id: 'childContainer', type: 'DOMNode', properties: {} },
        { id: 'childStyle', type: 'StyleNode', properties: { backgroundColor: 'rgb(0, 0, 0)' } },
        { id: 'childGeo', type: 'GeometryNode', properties: { width: 100, height: 100 } },
        { id: 'textNode', type: 'DOMNode', properties: { text: 'Hello' } }
      ],
      edges: [
        { source: 'parent', target: 'parentStyle', type: 'HAS_STYLE' },
        { source: 'childContainer', target: 'childStyle', type: 'HAS_STYLE' },
        { source: 'childContainer', target: 'childGeo', type: 'HAS_GEOMETRY' },
        { source: 'childContainer', target: 'parent', type: 'CHILD_OF' },
        { source: 'textNode', target: 'childContainer', type: 'CHILD_OF' }
      ]
    };

    const miner = new ComponentMiner();
    const result = miner.mine(graph, 'parent');
    
    expect(result.identifiedComponents).toHaveLength(1);
    expect(result.identifiedComponents[0].rootNodeId).toBe('childContainer');
    expect(result.identifiedComponents[0].typeHint).toBe('Container');
  });

  it('should return empty if no components match criteria', () => {
     const graph: ObservationGraph = {
      snapshot: {},
      nodes: [
        { id: 'parent', type: 'DOMNode', properties: {} }
      ],
      edges: []
    };
    
    const miner = new ComponentMiner();
    const result = miner.mine(graph, 'parent');
    expect(result.identifiedComponents).toHaveLength(0);
  });
});
