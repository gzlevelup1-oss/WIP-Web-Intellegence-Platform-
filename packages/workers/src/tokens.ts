import { ObservationGraph, GraphNode } from './types.js';

function rgbaToHex(color: string): string {
  if (color.startsWith('rgb')) {
    const match = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
    if (match) {
      const r = parseInt(match[1]).toString(16).padStart(2, '0');
      const g = parseInt(match[2]).toString(16).padStart(2, '0');
      const b = parseInt(match[3]).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`;
    }
  }
  return color;
}

export class DesignTokenExtractor {
  public extract(graph: ObservationGraph) {
    const colorMap: Record<string, number> = {};
    const fontMap: Record<string, number> = {};
    const fontSizeMap: Record<string, number> = {};

    graph.nodes.forEach(node => {
      if (node.type === 'StyleNode' && node.properties) {
        const { backgroundColor, color, fontFamily, fontSize } = node.properties;
        
        if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
          const hex = rgbaToHex(backgroundColor);
          colorMap[hex] = (colorMap[hex] || 0) + 1;
        }
        
        if (color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
          const hex = rgbaToHex(color);
          colorMap[hex] = (colorMap[hex] || 0) + 1;
        }

        if (fontFamily) {
          fontMap[fontFamily] = (fontMap[fontFamily] || 0) + 1;
        }

        if (fontSize) {
          fontSizeMap[fontSize] = (fontSizeMap[fontSize] || 0) + 1;
        }
      }
    });

    const sortedColors = Object.entries(colorMap).sort((a, b) => b[1] - a[1]).map(e => e[0]);
    const sortedFonts = Object.entries(fontMap).sort((a, b) => b[1] - a[1]).map(e => e[0]);
    const sortedSizes = Object.entries(fontSizeMap).sort((a, b) => b[1] - a[1]).map(e => e[0]);

    return {
      colors: {
        primary: sortedColors[0] || null,
        secondary: sortedColors[1] || null,
        background: sortedColors[2] || sortedColors[0] || null,
      },
      typography: {
        fontFamilies: sortedFonts,
        fontSizes: sortedSizes
      }
    };
  }
}
