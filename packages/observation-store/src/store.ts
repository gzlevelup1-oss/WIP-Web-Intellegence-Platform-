import { IObservationStore, ObservationGraph, GraphNode } from './types.js';
import Graph from 'graphology';

export class MemoryObservationStore implements IObservationStore {
  private snapshots = new Map<string, ObservationGraph>();
  private graphs = new Map<string, Graph>();

  public async saveSnapshot(snapshotId: string, graphData: ObservationGraph): Promise<void> {
    this.snapshots.set(snapshotId, graphData);
    
    const graph = new Graph({ multi: true, type: 'directed' });
    
    for (const node of graphData.nodes) {
      if (!graph.hasNode(node.id)) {
        graph.addNode(node.id, { nodeType: node.type, ...node.properties });
      }
    }
    
    for (const edge of graphData.edges) {
      if (graph.hasNode(edge.source) && graph.hasNode(edge.target)) {
        graph.addEdge(edge.source, edge.target, { type: edge.type });
      }
    }
    
    this.graphs.set(snapshotId, graph);
  }

  public async getSnapshot(snapshotId: string): Promise<ObservationGraph | null> {
    return this.snapshots.get(snapshotId) || null;
  }

  public async queryNodes(snapshotId: string, predicate: (node: GraphNode) => boolean): Promise<GraphNode[]> {
    const graphData = this.snapshots.get(snapshotId);
    if (!graphData) return [];
    
    const graph = this.graphs.get(snapshotId);
    if (!graph) return [];
    
    const results: GraphNode[] = [];
    graph.forEachNode((node, attributes) => {
      const { nodeType, ...properties } = attributes;
      const graphNode = { id: node, type: nodeType, properties } as GraphNode;
      if (predicate(graphNode)) {
        results.push(graphNode);
      }
    });
    
    return results;
  }
  
  public getGraphologyInstance(snapshotId: string): Graph | null {
    return this.graphs.get(snapshotId) || null;
  }
}
