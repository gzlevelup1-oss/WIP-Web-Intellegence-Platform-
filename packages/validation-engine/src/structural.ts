import { Discrepancy } from './types.js';

interface TreeNode {
  id: string;
  tagName: string;
  text?: string;
  children: TreeNode[];
}

function buildTree(graph: any): TreeNode {
  const virtualRoot: TreeNode = { id: 'root', tagName: 'ROOT', children: [] };
  if (!graph || !graph.nodes) return virtualRoot;
  
  const nodes = graph.nodes.filter((n: any) => n.type === 'DOMNode');
  const edges = graph.edges || [];
  
  const nodeMap = new Map<string, TreeNode>();
  nodes.forEach((n: any) => {
    nodeMap.set(n.id, {
      id: n.id,
      tagName: n.properties?.tagName || '',
      text: n.properties?.text,
      children: []
    });
  });
  
  const childOfEdges = edges.filter((e: any) => e.type === 'CHILD_OF');
  
  nodes.forEach((n: any) => {
    const parentEdge = childOfEdges.find((e: any) => e.source === n.id);
    if (parentEdge) {
      const parentNode = nodeMap.get(parentEdge.target);
      const childNode = nodeMap.get(n.id);
      if (parentNode && childNode) {
        parentNode.children.push(childNode);
      }
    } else {
      const rootNode = nodeMap.get(n.id);
      if (rootNode) {
        virtualRoot.children.push(rootNode);
      }
    }
  });
  
  return virtualRoot;
}

function getTreeSize(t: TreeNode): number {
  let size = 1;
  for (const child of t.children) {
    size += getTreeSize(child);
  }
  return size;
}

function computeTED(t1: TreeNode | null, t2: TreeNode | null): number {
  if (!t1 && !t2) return 0;
  if (!t1 && t2) return getTreeSize(t2);
  if (t1 && !t2) return getTreeSize(t1);
  
  let cost = 0;
  if (t1!.tagName !== t2!.tagName) {
    cost += 1;
  }
  if (t1!.text !== t2!.text) {
    cost += 0.5;
  }
  
  const n1 = t1!.children.length;
  const n2 = t2!.children.length;
  
  const dp: number[][] = Array(n1 + 1).fill(0).map(() => Array(n2 + 1).fill(0));
  
  for (let i = 1; i <= n1; i++) dp[i][0] = dp[i-1][0] + getTreeSize(t1!.children[i-1]);
  for (let j = 1; j <= n2; j++) dp[0][j] = dp[0][j-1] + getTreeSize(t2!.children[j-1]);
  
  for (let i = 1; i <= n1; i++) {
    for (let j = 1; j <= n2; j++) {
      const costDelete = dp[i-1][j] + getTreeSize(t1!.children[i-1]);
      const costInsert = dp[i][j-1] + getTreeSize(t2!.children[j-1]);
      const costReplace = dp[i-1][j-1] + computeTED(t1!.children[i-1], t2!.children[j-1]);
      dp[i][j] = Math.min(costDelete, costInsert, costReplace);
    }
  }
  
  return cost + dp[n1][n2];
}

export function structuralDiff(originalGraph: any, reconstructedGraph: any): Discrepancy[] {
  const violations: Discrepancy[] = [];
  
  if (!originalGraph || !reconstructedGraph) {
    return violations;
  }
  
  const t1 = buildTree(originalGraph);
  const t2 = buildTree(reconstructedGraph);
  
  const ted = computeTED(t1, t2);
  const maxPossibleTED = getTreeSize(t1) + getTreeSize(t2);
  
  // Normalized Tree Edit Distance
  if (maxPossibleTED > 0) {
    const threshold = 0.1; // 10% tolerance for structural differences
    const diffRatio = ted / maxPossibleTED;
    if (diffRatio > threshold) {
      violations.push({
        type: 'Structural',
        message: `Tree Edit Distance exceeded threshold. Distance: ${ted}. Normalized difference: ${(diffRatio * 100).toFixed(2)}%.`
      });
    }
  }
  
  return violations;
}
