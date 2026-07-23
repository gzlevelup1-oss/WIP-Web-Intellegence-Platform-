export const evaluateSnapshot = `({ snapshotId, url, levels = [0] }) => {
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
    
    const attributes = {};
    if (el.attributes) {
      for (let i = 0; i < el.attributes.length; i++) {
        const attr = el.attributes[i];
        if (attr.name !== 'data-wip-id') {
          attributes[attr.name] = attr.value;
        }
      }
    }
    
    const properties = {
      tagName: el.tagName ? el.tagName.toLowerCase() : '',
      nodeType: el.nodeType,
      classes,
      attributes,
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
    
    if (parentId) {
      graph.edges.push({ source: domNodeId, target: parentId, type: 'CHILD_OF' });
    } else {
      graph.edges.push({ source: domNodeId, target: snapshotId, type: 'BELONGS_TO' });
    }
    
    let geoProperties = { x: 0, y: 0, width: 0, height: 0, top: 0, right: 0, bottom: 0, left: 0 };
    let styleProperties = { display: 'none', position: 'static', backgroundColor: 'transparent', color: 'inherit', fontFamily: 'inherit', fontSize: '16px', margin: '0px', padding: '0px', opacity: '1', zIndex: 'auto', cursor: 'auto' };
    
    if ((levels.includes(1) || levels.includes('STYLE') || levels.includes('GEOMETRY') || levels.includes('VISUAL')) && el.getBoundingClientRect && window.getComputedStyle) {
      const rect = el.getBoundingClientRect();
      geoProperties = {
        x: rect.x, y: rect.y, width: rect.width, height: rect.height,
        top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left
      };
      
      const computed = window.getComputedStyle(el);
      styleProperties = {
        display: computed.display, position: computed.position, backgroundColor: computed.backgroundColor,
        color: computed.color, fontFamily: computed.fontFamily, fontSize: computed.fontSize,
        margin: computed.margin, padding: computed.padding, opacity: computed.opacity, zIndex: computed.zIndex,
        cursor: computed.cursor
      };
      
      const extractPseudo = (pseudoType) => {
        const pseudoComputed = window.getComputedStyle(el, pseudoType);
        if (pseudoComputed && pseudoComputed.content && pseudoComputed.content !== 'none' && pseudoComputed.content !== 'normal') {
          const pseudoDomId = 'node-' + (nodeIdCounter++);
          graph.nodes.push({
            id: pseudoDomId,
            type: 'DOMNode',
            properties: {
              tagName: pseudoType,
              nodeType: 1,
              classes: [],
              attributes: {},
              depth: depth + 1,
              text: pseudoComputed.content.replace(/^"|"$/g, '')
            }
          });
          graph.edges.push({ source: pseudoDomId, target: domNodeId, type: 'CHILD_OF' });
          
          const pseudoStyleId = 'style-' + (nodeIdCounter++);
          graph.nodes.push({
            id: pseudoStyleId,
            type: 'StyleNode',
            properties: {
              display: pseudoComputed.display, position: pseudoComputed.position, backgroundColor: pseudoComputed.backgroundColor,
              color: pseudoComputed.color, fontFamily: pseudoComputed.fontFamily, fontSize: pseudoComputed.fontSize,
              margin: pseudoComputed.margin, padding: pseudoComputed.padding, opacity: pseudoComputed.opacity, zIndex: pseudoComputed.zIndex
            }
          });
          graph.edges.push({ source: pseudoDomId, target: pseudoStyleId, type: 'HAS_STYLE' });
        }
      };
      
      extractPseudo('::before');
      extractPseudo('::after');
    }
    
    const geoNodeId = 'geo-' + (nodeIdCounter++);
    const styleNodeId = 'style-' + (nodeIdCounter++);
    
    graph.nodes.push({ id: geoNodeId, type: 'GeometryNode', properties: geoProperties });
    graph.nodes.push({ id: styleNodeId, type: 'StyleNode', properties: styleProperties });
    graph.edges.push({ source: domNodeId, target: geoNodeId, type: 'HAS_GEOMETRY' });
    graph.edges.push({ source: domNodeId, target: styleNodeId, type: 'HAS_STYLE' });
    
    // Level 2: Accessibility
    if ((levels.includes(2) || levels.includes('A11Y')) && el.hasAttribute) {
      const a11yNodeId = 'a11y-' + (nodeIdCounter++);
      const role = el.getAttribute('role') || '';
      const ariaLabel = el.getAttribute('aria-label') || '';
      const ariaHidden = el.getAttribute('aria-hidden') === 'true';
      const alt = el.getAttribute('alt') || '';
      
      let computedRole = role;
      if (!computedRole) {
        if (properties.tagName === 'button') computedRole = 'button';
        else if (properties.tagName === 'a' && el.hasAttribute('href')) computedRole = 'link';
        else if (properties.tagName === 'input') computedRole = 'textbox';
        else if (properties.tagName === 'img') computedRole = 'img';
      }
      if (computedRole || ariaLabel || ariaHidden || alt) {
        graph.nodes.push({
          id: a11yNodeId,
          type: 'A11yNode',
          properties: {
            role: computedRole,
            ariaLabel,
            ariaHidden,
            alt
          }
        });
        graph.edges.push({ source: domNodeId, target: a11yNodeId, type: 'HAS_A11Y' });
      }
    }
    
    // Level 5: Interactive
    if (levels.includes(5) || levels.includes('INTERACTIVE')) {
      const hasClick = (el.hasAttribute && el.hasAttribute('onclick')) || properties.tagName === 'a' || properties.tagName === 'button' || (el.getAttribute && el.getAttribute('role') === 'button');
      const tabIndex = el.getAttribute ? el.getAttribute('tabindex') : null;
      const cursor = styleProperties.cursor;
      
      const listeners = [];
      for (const attr in attributes) {
        if (attr.startsWith('on')) listeners.push(attr.substring(2));
      }
      
      if (hasClick || tabIndex !== null || cursor === 'pointer' || listeners.length > 0) {
        const interactiveNodeId = 'interactive-' + (nodeIdCounter++);
        graph.nodes.push({
          id: interactiveNodeId,
          type: 'InteractiveNode',
          properties: {
            interactiveType: hasClick ? 'click' : 'custom',
            tabIndex: tabIndex !== null ? parseInt(tabIndex, 10) : undefined,
            cursor,
            listeners
          }
        });
        graph.edges.push({ source: domNodeId, target: interactiveNodeId, type: 'HAS_INTERACTION' });
      }
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
  
  // Level 6: Performance / Resources
  if (levels.includes(6) || levels.includes('RESOURCE')) {
    const resources = window.performance.getEntriesByType('resource');
    resources.forEach((res) => {
      const resourceId = 'resource-' + (nodeIdCounter++);
      graph.nodes.push({
        id: resourceId,
        type: 'ResourceNode',
        properties: {
          url: res.name,
          type: res.initiatorType || 'unknown',
          initiatorType: res.initiatorType,
          duration: res.duration,
          transferSize: res.transferSize
        }
      });
      graph.edges.push({ source: snapshotId, target: resourceId, type: 'HAS_RESOURCE' });
    });
  }
  
  return graph;
}`;
