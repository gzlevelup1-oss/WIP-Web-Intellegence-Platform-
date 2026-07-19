import { ObservationGraph, GraphNode } from './types.js';

export class LayoutAnalyzer {
  public analyze(graph: ObservationGraph, containerNodeId: string) {
    const childrenEdges = graph.edges.filter(e => e.target === containerNodeId && e.type === 'CHILD_OF');
    const childIds = childrenEdges.map(e => e.source);

    const childGeometries = childIds.map(childId => {
      const geoEdge = graph.edges.find(e => e.source === childId && e.type === 'HAS_GEOMETRY');
      if (geoEdge) {
        const geoNode = graph.nodes.find(n => n.id === geoEdge.target);
        if (geoNode) {
          return { id: childId, rect: geoNode.properties };
        }
      }
      return null;
    }).filter(g => g !== null) as { id: string, rect: any }[];

    if (childGeometries.length < 2) {
      return { layoutType: 'Unknown', children: childIds, gap: 0 };
    }

    let isRow = true;
    let isCol = true;
    const yCenters = childGeometries.map(g => g.rect.y + g.rect.height / 2);
    const xCenters = childGeometries.map(g => g.rect.x + g.rect.width / 2);

    for (let i = 1; i < yCenters.length; i++) {
      if (Math.abs(yCenters[i] - yCenters[0]) > 5) isRow = false;
      if (Math.abs(xCenters[i] - xCenters[0]) > 5) isCol = false;
    }

    let layoutType = 'Unknown';
    let alignment = 'unknown';
    if (isRow && !isCol) {
      layoutType = 'Row';
      alignment = 'center-y';
    } else if (isCol && !isRow) {
      layoutType = 'Column';
      alignment = 'center-x';
    }

    let gaps = [];
    if (layoutType === 'Row') {
      const sorted = [...childGeometries].sort((a, b) => a.rect.x - b.rect.x);
      for (let i = 1; i < sorted.length; i++) {
        gaps.push(Math.round(sorted[i].rect.x - (sorted[i-1].rect.x + sorted[i-1].rect.width)));
      }
    } else if (layoutType === 'Column') {
      const sorted = [...childGeometries].sort((a, b) => a.rect.y - b.rect.y);
      for (let i = 1; i < sorted.length; i++) {
        gaps.push(Math.round(sorted[i].rect.y - (sorted[i-1].rect.y + sorted[i-1].rect.height)));
      }
    }

    const gap = gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;

    return {
      layoutType,
      alignment,
      gap,
      children: childIds
    };
  }
}
