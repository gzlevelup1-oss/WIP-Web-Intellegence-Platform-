export interface GraphNode {
  id: string;
  type: string;
  properties: Record<string, any>;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
}

export interface ObservationGraph {
  snapshot: Record<string, any>;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface IObservationStore {
  saveSnapshot(snapshotId: string, graph: ObservationGraph): Promise<void>;
  getSnapshot(snapshotId: string): Promise<ObservationGraph | null>;
  queryNodes(snapshotId: string, predicate: (node: GraphNode) => boolean): Promise<GraphNode[]>;
}
