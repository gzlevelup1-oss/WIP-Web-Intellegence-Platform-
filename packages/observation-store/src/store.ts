import { IObservationStore, ObservationGraph, GraphNode } from './types.js';

export class MemoryObservationStore implements IObservationStore {
  private snapshots = new Map<string, ObservationGraph>();

  public async saveSnapshot(snapshotId: string, graph: ObservationGraph): Promise<void> {
    this.snapshots.set(snapshotId, graph);
  }

  public async getSnapshot(snapshotId: string): Promise<ObservationGraph | null> {
    return this.snapshots.get(snapshotId) || null;
  }

  public async queryNodes(snapshotId: string, predicate: (node: GraphNode) => boolean): Promise<GraphNode[]> {
    const graph = this.snapshots.get(snapshotId);
    if (!graph) return [];
    
    return graph.nodes.filter(predicate);
  }
}
