import { Discrepancy } from './types.js';

export function accessibilityDiff(originalGraph: any, reconstructedGraph: any): Discrepancy[] {
  const violations: Discrepancy[] = [];
  
  if (!originalGraph || !reconstructedGraph) {
    return violations;
  }

  const getA11ySummaries = (graph: any) => {
    const summaries: string[] = [];
    if (!graph.nodes || !graph.edges) return summaries;
    
    const a11yNodes = graph.nodes.filter((n: any) => n.type === 'A11yNode');
    const a11yEdges = graph.edges.filter((e: any) => e.type === 'HAS_A11Y');
    
    a11yEdges.forEach((edge: any) => {
      const domNode = graph.nodes.find((n: any) => n.id === edge.source);
      const a11yNode = a11yNodes.find((n: any) => n.id === edge.target);
      if (domNode && a11yNode) {
        const tagName = domNode.properties?.tagName || 'UNKNOWN';
        const role = a11yNode.properties?.role || 'none';
        const tabIndex = a11yNode.properties?.tabIndex ?? null;
        // Ignore nodes with no semantic role and no tabIndex if they are not impactful
        if (role !== 'none' || tabIndex !== null) {
          summaries.push(`${tagName}|${role}|${tabIndex}`);
        }
      }
    });
    return summaries.sort();
  };
  
  const origSummaries = getA11ySummaries(originalGraph);
  const reconSummaries = getA11ySummaries(reconstructedGraph);
  
  const origStr = JSON.stringify(origSummaries);
  const reconStr = JSON.stringify(reconSummaries);
  
  if (origStr !== reconStr) {
    violations.push({
      type: 'Accessibility',
      message: `Accessibility tree mismatch. Original has ${origSummaries.length} semantic nodes, reconstructed has ${reconSummaries.length}.`
    });
  }
  
  return violations;
}
