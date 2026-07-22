import React, { useMemo } from 'react';
import * as reactWindow from 'react-window';
const { FixedSizeList: List } = reactWindow as any;
import { AutoSizer } from './AutoSizer';
import { ChevronRight, ChevronDown, Layers } from 'lucide-react';
import { useLab, ObservationGraph } from '../context/LabContext';

interface InspectorRowProps {
  index: number;
  style: React.CSSProperties;
  data: any[];
}

const InspectorRow = ({ index, style, data }: InspectorRowProps) => {
  const node = data[index];
  const props = node.properties || {};
  const depth = node.computedDepth || 0;
  const isDOM = node.type === 'DOMNode';
  
  return (
    <div 
      style={style} 
      className="flex items-center px-4 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer font-mono text-xs border-b border-transparent dark:hover:border-zinc-800 transition-colors"
    >
      <div 
        style={{ paddingLeft: `${depth * 16}px` }}
        className="flex items-center w-full whitespace-nowrap overflow-hidden text-ellipsis"
      >
        <button className="p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 mr-1">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
        {isDOM ? (
          <>
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              &lt;{props.tagName}&gt;
            </span>
            {props.attributes?.id && (
              <span className="text-purple-600 dark:text-purple-400 ml-2">
                #{props.attributes.id}
              </span>
            )}
            {props.attributes?.class && (
              <span className="text-amber-600 dark:text-amber-400 ml-2">
                .{props.attributes.class.split(' ').join('.')}
              </span>
            )}
            {props.text && (
              <span className="text-zinc-500 ml-2 truncate">
                "{props.text.length > 30 ? props.text.substring(0, 30) + '...' : props.text}"
              </span>
            )}
          </>
        ) : (
          <span className="text-purple-600 dark:text-purple-400 font-medium">
            [{node.type}] {node.id}
          </span>
        )}
      </div>
    </div>
  );
};

export function ObservationInspector() {
  const { graph, isLoading } = useLab();

  const flattenedNodes = useMemo(() => {
    if (!graph) return [];
    
    // Build adjacency list for tree calculation
    const childrenMap = new Map<string, string[]>();
    const roots = new Set<string>(graph.nodes.map(n => n.id));
    
    for (const edge of graph.edges) {
      if (edge.type === 'has_child') {
        if (!childrenMap.has(edge.source)) childrenMap.set(edge.source, []);
        childrenMap.get(edge.source)!.push(edge.target);
        roots.delete(edge.target); // If it's a target, it's not a root
      }
    }

    const nodeMap = new Map<string, any>(graph.nodes.map(n => [n.id, n]));
    const result: any[] = [];

    // DFS to flatten tree and assign depth
    const traverse = (nodeId: string, depth: number) => {
      const node = nodeMap.get(nodeId);
      if (node) {
        result.push({ ...node, computedDepth: depth });
        const children = childrenMap.get(nodeId) || [];
        for (const childId of children) {
          traverse(childId, depth + 1);
        }
      }
    };

    // Traverse from roots
    for (const rootId of Array.from(roots)) {
      traverse(rootId, 0);
    }
    
    // Add any disconnected/non-tree nodes that might have been missed
    for (const node of graph.nodes) {
      if (!result.find(r => r.id === node.id)) {
         result.push({ ...node, computedDepth: 0 });
      }
    }

    return result;
  }, [graph]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 w-full overflow-hidden">
      {/* Inspector Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
        <Layers className="w-4 h-4 text-zinc-500" />
        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
          Observation Graph {graph ? `(${flattenedNodes.length} nodes, ${graph.edges.length} edges)` : ''}
        </span>
      </div>
      
      {/* Virtualized List */}
      <div className="flex-1 w-full h-full relative">
        {!graph && !isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-zinc-500">
            Waiting for snapshot...
          </div>
        ) : isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-zinc-500">
            Simulating capture...
          </div>
        ) : (
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                width={width}
                itemCount={flattenedNodes.length}
                itemSize={28}
                itemData={flattenedNodes}
              >
                {InspectorRow}
              </List>
            )}
          </AutoSizer>
        )}
      </div>
    </div>
  );
}
