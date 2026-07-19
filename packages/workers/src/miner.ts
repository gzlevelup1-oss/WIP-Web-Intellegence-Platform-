import { ObservationGraph, GraphNode } from './types.js';

export class ComponentMiner {
  public mine(graph: ObservationGraph, containerNodeId: string) {
    const components: any[] = [];
    const visited = new Set<string>();
    
    const getNode = (id: string) => graph.nodes.find(n => n.id === id);
    const getEdge = (source: string, type: string) => graph.edges.find(e => e.source === source && e.type === type);
    
    const traverse = (nodeId: string, parentBgColor: string | null = null) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = getNode(nodeId);
      if (!node) return;

      const styleEdge = getEdge(nodeId, 'HAS_STYLE');
      const styleNode = styleEdge ? getNode(styleEdge.target) : null;
      const geoEdge = getEdge(nodeId, 'HAS_GEOMETRY');
      const geoNode = geoEdge ? getNode(geoEdge.target) : null;

      let currentBgColor = parentBgColor;
      if (styleNode && styleNode.properties.backgroundColor && styleNode.properties.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        currentBgColor = styleNode.properties.backgroundColor;
      }

      let isComponentRoot = false;
      if (parentBgColor && currentBgColor !== parentBgColor) {
        if (geoNode && geoNode.properties.width > 0 && geoNode.properties.height > 0) {
           isComponentRoot = true;
        }
      }

      const childrenEdges = graph.edges.filter(e => e.target === nodeId && e.type === 'CHILD_OF');
      let textNodes = 0;
      let interactiveNodes = 0;

      for (const edge of childrenEdges) {
        const childNode = getNode(edge.source);
        if (childNode) {
          if (childNode.properties.text) textNodes++;
          if (childNode.properties.tagName === 'button' || childNode.properties.tagName === 'a') interactiveNodes++;
          traverse(edge.source, currentBgColor);
        }
      }
      
      if (isComponentRoot && (textNodes > 0 || interactiveNodes > 0)) {
         components.push({
           rootNodeId: nodeId,
           typeHint: interactiveNodes > 0 ? 'InteractiveContainer' : 'Container',
           geometry: geoNode ? { width: geoNode.properties.width, height: geoNode.properties.height } : null,
           descendantSummary: { textNodes, interactiveNodes }
         });
      }
    };

    traverse(containerNodeId);

    return {
      identifiedComponents: components
    };
  }
}
