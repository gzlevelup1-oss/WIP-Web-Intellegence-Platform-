import { describe, it, expect } from 'vitest';
import { DesignTokenExtractor } from '../tokens.js';
import { ObservationGraph } from '../types.js';

describe('DesignTokenExtractor', () => {
  it('should extract common colors and typography', () => {
    const graph: ObservationGraph = {
      snapshot: {},
      edges: [],
      nodes: [
        {
          id: '1',
          type: 'StyleNode',
          properties: {
            backgroundColor: 'rgb(255, 0, 0)',
            color: 'rgb(255, 255, 255)',
            fontFamily: 'Arial',
            fontSize: '16px'
          }
        },
        {
          id: '2',
          type: 'StyleNode',
          properties: {
            backgroundColor: 'rgb(255, 0, 0)',
            color: 'rgb(0, 0, 0)',
            fontFamily: 'Arial',
            fontSize: '14px'
          }
        }
      ]
    };

    const extractor = new DesignTokenExtractor();
    const tokens = extractor.extract(graph);

    expect(tokens.colors.primary).toBe('#ff0000');
    expect(tokens.typography.fontFamilies).toContain('Arial');
    expect(tokens.typography.fontSizes).toContain('16px');
    expect(tokens.typography.fontSizes).toContain('14px');
  });

  it('should ignore transparent colors', () => {
    const graph: ObservationGraph = {
      snapshot: {},
      edges: [],
      nodes: [
        {
          id: '1',
          type: 'StyleNode',
          properties: {
            backgroundColor: 'transparent',
            color: 'rgba(0, 0, 0, 0)'
          }
        }
      ]
    };
    
    const extractor = new DesignTokenExtractor();
    const tokens = extractor.extract(graph);
    
    expect(tokens.colors.primary).toBeNull();
  });
});
