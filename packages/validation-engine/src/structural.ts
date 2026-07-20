import { Discrepancy } from './types.js';

export function structuralDiff(originalGraph: any, reconstructedGraph: any): Discrepancy[] {
  const violations: Discrepancy[] = [];
  
  if (!originalGraph || !reconstructedGraph) {
    return violations;
  }
  
  // Basic bounding box check for top-level geometries, if available
  // In a full implementation, this would map nodes and compare trees
  const originalNodes = originalGraph.nodes || [];
  const reconstructedNodes = reconstructedGraph.nodes || [];
  
  // Simple check for node count mismatch (structural)
  if (Math.abs(originalNodes.length - reconstructedNodes.length) > 10) {
    violations.push({
      type: 'Structural',
      message: `Significant node count mismatch: Original has ${originalNodes.length}, Reconstructed has ${reconstructedNodes.length}`,
    });
  }

  // Simplified geometry check
  const origGeo = originalNodes.find((n: any) => n.type === 'GeometryNode');
  const reconGeo = reconstructedNodes.find((n: any) => n.type === 'GeometryNode');

  if (origGeo && reconGeo) {
    const p1 = origGeo.properties;
    const p2 = reconGeo.properties;
    
    if (Math.abs(p1.width - p2.width) > 2 || Math.abs(p1.height - p2.height) > 2) {
       violations.push({
         type: 'Visual',
         message: `Bounding box dimension mismatch on primary geometry. Expected w:${p1.width}, h:${p1.height}. Actual w:${p2.width}, h:${p2.height}.`
       });
    }
  }

  return violations;
}
