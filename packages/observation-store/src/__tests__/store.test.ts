import { describe, it, expect } from 'vitest';
import { MemoryObservationStore } from '../store.js';
import { ObservationGraph } from '../types.js';

describe('MemoryObservationStore', () => {
  it('should save and retrieve a snapshot', async () => {
    const store = new MemoryObservationStore();
    const graph: ObservationGraph = {
      snapshot: { id: 's1', timestamp: 123 },
      nodes: [
        { id: 'n1', type: 'DOMNode', properties: { tagName: 'div' } }
      ],
      edges: []
    };

    await store.saveSnapshot('s1', graph);
    const retrieved = await store.getSnapshot('s1');
    expect(retrieved).toEqual(graph);
  });

  it('should return null for non-existent snapshot', async () => {
    const store = new MemoryObservationStore();
    const retrieved = await store.getSnapshot('non-existent');
    expect(retrieved).toBeNull();
  });

  it('should query nodes by predicate', async () => {
    const store = new MemoryObservationStore();
    const graph: ObservationGraph = {
      snapshot: { id: 's1' },
      nodes: [
        { id: 'n1', type: 'DOMNode', properties: { tagName: 'div' } },
        { id: 'n2', type: 'DOMNode', properties: { tagName: 'span' } },
        { id: 'n3', type: 'GeometryNode', properties: { width: 100 } }
      ],
      edges: []
    };

    await store.saveSnapshot('s1', graph);

    const divs = await store.queryNodes('s1', n => n.properties.tagName === 'div');
    expect(divs.length).toBe(1);
    expect(divs[0].id).toBe('n1');

    const domNodes = await store.queryNodes('s1', n => n.type === 'DOMNode');
    expect(domNodes.length).toBe(2);
  });

  it('should return empty array when querying non-existent snapshot', async () => {
    const store = new MemoryObservationStore();
    const results = await store.queryNodes('non-existent', n => true);
    expect(results).toEqual([]);
  });
});
