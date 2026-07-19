export interface GraphNode {
  id: string;
  type: string;
  properties: any;
}
export interface GraphEdge {
  source: string;
  target: string;
  type: string;
}
export interface ObservationGraph {
  snapshot: any;
  nodes: GraphNode[];
  edges: GraphEdge[];
}
