export const evaluateSnapshot = `
({ snapshotId, url }) => {
  const graph = {
    snapshot: {
      id: snapshotId,
      timestamp: Date.now(),
      url
    },
    nodes: [],
    edges: []
  };
  
  graph.nodes.push({
    id: snapshotId,
    type: 'SnapshotNode',
    properties: {
      url,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight
    }
  });
  
  let nodeIdCounter = 0;
  
  const traverse = (el, parentId, depth) => {
    const domNodeId = 'node-' + (nodeIdCounter++);
    const geoNodeId = 'geo-' + (nodeIdCounter++);
    const styleNodeId = 'style-' + (nodeIdCounter++);
    
    if (el.setAttribute) {
      el.setAttribute('data-wip-id', domNodeId);
    }
    
    const classes = el.className && typeof el.className === 'string' ? el.className.split(' ').filter(c => c) : [];
    
    let text = '';
    for (const child of Array.from(el.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
        text += child.textContent.trim() + ' ';
      }
    }
    
    const properties = {
      tagName: el.tagName.toLowerCase(),
      nodeType: el.nodeType,
      classes,
      depth
    };
    
    if (text.trim()) {
      properties.text = text.trim();
    }
    
    // 1. Add DOMNode
    graph.nodes.push({
      id: domNodeId,
      type: 'DOMNode',
      properties
    });
    
    // 2. Add GeometryNode
    const rect = el.getBoundingClientRect();
    graph.nodes.push({
      id: geoNodeId,
      type: 'GeometryNode',
      properties: {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left
      }
    });
    
    // 3. Add StyleNode (just a few key properties to avoid massive payloads)
    const computed = window.getComputedStyle(el);
    graph.nodes.push({
      id: styleNodeId,
      type: 'StyleNode',
      properties: {
        display: computed.display,
        position: computed.position,
        backgroundColor: computed.backgroundColor,
        color: computed.color,
        fontFamily: computed.fontFamily,
        fontSize: computed.fontSize,
        margin: computed.margin,
        padding: computed.padding,
        opacity: computed.opacity,
        zIndex: computed.zIndex
      }
    });
    
    // Edges
    graph.edges.push({ source: domNodeId, target: geoNodeId, type: 'HAS_GEOMETRY' });
    graph.edges.push({ source: domNodeId, target: styleNodeId, type: 'HAS_STYLE' });
    
    if (parentId) {
      graph.edges.push({ source: domNodeId, target: parentId, type: 'CHILD_OF' });
    } else {
      graph.edges.push({ source: domNodeId, target: snapshotId, type: 'BELONGS_TO' });
    }
    
    for (const child of Array.from(el.children)) {
      traverse(child, domNodeId, depth + 1);
    }
    if (el.shadowRoot) {
      for (const child of Array.from(el.shadowRoot.children)) {
        traverse(child, domNodeId, depth + 1);
      }
    }
  };
  
  traverse(document.documentElement, null, 0);
  return graph;
}
`;
