export interface BaseNode<T extends string, P> {
  id: string;
  type: T;
  properties: P;
}

export type DOMNode = BaseNode<'DOMNode', {
  nodeId?: string;
  tagName: string;
  nodeType?: number;
  attributes?: Record<string, string>;
  classes?: string[];
  [key: string]: any;
}>;

export type StyleNode = BaseNode<'StyleNode', {
  display?: string;
  position?: string;
  backgroundColor?: string;
  color?: string;
  fontFamily?: string;
  opacity?: string;
  margin?: string;
  padding?: string;
  [key: string]: any;
}>;

export type GeometryNode = BaseNode<'GeometryNode', {
  x: number;
  y: number;
  width: number;
  height: number;
  scrollX?: number;
  scrollY?: number;
  zIndex?: number | string;
  [key: string]: any;
}>;

export type A11yNode = BaseNode<'A11yNode', {
  role?: string;
  name?: string;
  value?: string;
  disabled?: boolean;
  expanded?: boolean;
  focused?: boolean;
  [key: string]: any;
}>;

export type InteractiveNode = BaseNode<'InteractiveNode', {
  eventListeners?: string[];
  [key: string]: any;
}>;

export type NetworkRequestNode = BaseNode<'NetworkRequestNode', {
  url: string;
  method: string;
  status: number;
  mimeType?: string;
  payloadSize?: number;
  [key: string]: any;
}>;

export type ResourceNode = BaseNode<'ResourceNode', {
  url: string;
  type: string;
  cached?: boolean;
  size?: number;
  [key: string]: any;
}>;

export type TemporalNode = BaseNode<'TemporalNode', {
  animationName?: string;
  duration?: number;
  playState?: string;
  currentTime?: number;
  [key: string]: any;
}>;

export type PerformanceNode = BaseNode<'PerformanceNode', {
  fps?: number;
  layoutShiftScore?: number;
  domContentLoaded?: number;
  [key: string]: any;
}>;

export type ValidationNode = BaseNode<'ValidationNode', {
  ssimScore?: number;
  mseScore?: number;
  structuralMatch?: boolean;
  [key: string]: any;
}>;

export type SnapshotNode = BaseNode<'SnapshotNode', {
  snapshotId: string;
  timestamp: number;
  url: string;
  viewportWidth?: number;
  viewportHeight?: number;
  [key: string]: any;
}>;

export type GraphNode =
  | DOMNode
  | StyleNode
  | GeometryNode
  | A11yNode
  | InteractiveNode
  | NetworkRequestNode
  | ResourceNode
  | TemporalNode
  | PerformanceNode
  | ValidationNode
  | SnapshotNode;

export type EdgeType = 
  | 'CHILD_OF'
  | 'HAS_SHADOW_ROOT'
  | 'CONTAINS_IFRAME'
  | 'HAS_STYLE'
  | 'HAS_GEOMETRY'
  | 'HAS_A11Y'
  | 'HAS_INTERACTION'
  | 'OVERLAPS'
  | 'ABOVE'
  | 'BELOW'
  | 'LEFT_OF'
  | 'RIGHT_OF'
  | 'CLIPPED_BY'
  | 'INITIATED_REQUEST'
  | 'LOADED_RESOURCE'
  | 'HAS_ANIMATION'
  | 'BELONGS_TO'
  | 'HAS_PERFORMANCE'
  | 'HAS_VALIDATION';

export interface GraphEdge {
  source: string;
  target: string;
  type: EdgeType | string;
}

export interface ObservationGraph {
  snapshot: {
    id: string;
    timestamp: number;
    url: string;
    [key: string]: any;
  };
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface IObservationStore {
  saveSnapshot(snapshotId: string, graph: ObservationGraph): Promise<void>;
  getSnapshot(snapshotId: string): Promise<ObservationGraph | null>;
  queryNodes(snapshotId: string, predicate: (node: GraphNode) => boolean): Promise<GraphNode[]>;
}
