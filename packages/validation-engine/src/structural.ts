import { Discrepancy } from './types.js';
import * as jsondiffpatch from 'jsondiffpatch';

export function structuralDiff(originalGraph: any, reconstructedGraph: any): Discrepancy[] {
  const violations: Discrepancy[] = [];

  if (!originalGraph || !reconstructedGraph) {
    return violations;
  }

  const differ = jsondiffpatch.create({
    objectHash: (obj: any) => obj.id || JSON.stringify(obj),
    arrays: {
      detectMove: true,
      includeValueOnMove: false
    }
  });

  const originalNodes = (originalGraph.nodes || []).filter((n: any) => n.type === 'DOMNode');
  const reconstructedNodes = (reconstructedGraph.nodes || []).filter((n: any) => n.type === 'DOMNode');

  const delta = differ.diff(originalNodes, reconstructedNodes);

  if (delta) {
    // Calculate a rough diff ratio based on the number of changes
    const numChanges = Object.keys(delta).filter(k => k !== '_t').length;
    const maxPossibleChanges = Math.max(originalNodes.length, reconstructedNodes.length);
    const diffRatio = maxPossibleChanges > 0 ? numChanges / maxPossibleChanges : 0;
    
    // We keep the threshold logic for compatibility with AFR-002 constraints and existing tests
    const threshold = 0.05; 
    
    // Sometimes structural mismatch is completely different tree, then diffRatio could be very high
    if (diffRatio > threshold) {
      violations.push({
        type: 'Structural',
        message: `Structural discrepancy exceeded threshold. Delta count: ${numChanges}. Normalized difference: ${(diffRatio * 100).toFixed(2)}%.`
      });
    }
  }

  return violations;
}
