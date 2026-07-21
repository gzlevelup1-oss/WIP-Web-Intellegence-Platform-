const { structuralDiff } = require('./packages/validation-engine/dist/structural.js');

const graph1 = { nodes: [], edges: [] };
const graph2 = { nodes: [], edges: [] };

for(let i=1; i<=10; i++) {
  graph1.nodes.push({ id: String(i), type: 'DOMNode', properties: { tagName: 'div' } });
  graph2.nodes.push({ id: String(i), type: 'DOMNode', properties: { tagName: 'div' } });
  if (i > 1) {
    graph1.edges.push({ source: String(i), target: '1', type: 'CHILD_OF' });
    graph2.edges.push({ source: String(i), target: '1', type: 'CHILD_OF' });
  }
}

// Change one node in graph2
graph2.nodes[9].properties.tagName = 'span';

console.log(structuralDiff(graph1, graph2));
