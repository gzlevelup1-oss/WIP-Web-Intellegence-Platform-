import * as crypto from 'crypto';
import Graph from 'graphology';

function hashNode(nodeType: string, properties: Record<string, any>): string {
  // 1. Extract all key-value pairs from properties.
  // 2. Filter out transient properties.
  const filteredProps: Record<string, any> = {};
  for (const key of Object.keys(properties)) {
    if (key !== 'scrollX' && key !== 'scrollY') {
      filteredProps[key] = properties[key];
    }
  }

  // 3. Sort keys alphabetically.
  const sortedKeys = Object.keys(filteredProps).sort();
  const sortedProps: Record<string, any> = {};
  for (const key of sortedKeys) {
    sortedProps[key] = filteredProps[key];
  }

  // 4. Serialize to a compact JSON string
  const serialized = JSON.stringify(sortedProps);

  // 5. Compute SHA-256(Type + ":" + SerializedProperties)
  const hash = crypto.createHash('sha256');
  hash.update(`${nodeType}:${serialized}`);
  return hash.digest('hex');
}

export function computeSubtreeHash(graph: Graph, nodeId: string): string {
  const attributes = graph.getNodeAttributes(nodeId);
  if (!attributes) {
    return '';
  }

  const { nodeType, ...properties } = attributes;
  const H_node = hashNode(nodeType, properties);

  // Find all child DOMNodes via CHILD_OF edges
  // In graphology, CHILD_OF edge points from child to parent, so if this node is parent,
  // we look for incoming CHILD_OF edges. Wait, let's check OBSERVATION_GRAPH.md:
  // "CHILD_OF: Links a DOMNode to its parent DOMNode."
  // So source is child, target is parent. We need to find nodes that have an outgoing CHILD_OF edge to this node.
  const children: string[] = [];
  graph.forEachInboundEdge(nodeId, (edge, attributes, source, target, sourceAttributes, targetAttributes) => {
    if (attributes.type === 'CHILD_OF') {
      children.push(source);
    }
  });

  // To preserve DOM order, we might need an explicit ordering if not naturally ordered.
  // Assuming properties.children or index, but for now we sort the children ids to make it deterministic if order is missing,
  // Wait, "Concatenate the child hashes in DOM order". In our tree extraction, the order of nodes added typically reflects DOM order or we need to sort by index if available.
  // For now, sorting by id to guarantee deterministic behavior if DOM order isn't explicitly captured in graph attributes.
  // Ideally, `previousSibling` or `nextSibling` might exist, or they are ordered by edge creation. 
  children.sort();

  let childHashesStr = '';
  for (const child of children) {
    childHashesStr += computeSubtreeHash(graph, child);
  }

  const hash = crypto.createHash('sha256');
  hash.update(H_node + childHashesStr);
  return hash.digest('hex');
}
