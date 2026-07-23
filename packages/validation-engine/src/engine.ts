import { calculateColorDeltaE } from './color.js';
import { structuralDiff } from './structural.js';
import { visualDiff } from './visual.js';
import { accessibilityDiff } from './accessibility.js';
import { DiscrepancyReport, Discrepancy } from './types.js';
import { MaskRegion } from './visual.js';
import * as fs from 'fs';
import * as path from 'path';

export interface ValidationRequest {
  originalGraph: any;
  reconstructedGraph: any;
  originalScreenshotBase64: string;
  reconstructedScreenshotBase64: string;
}

export function validate(request: ValidationRequest): DiscrepancyReport {
  const violations: Discrepancy[] = [];
  
  // 1. Structural diffing
  const structuralViolations = structuralDiff(request.originalGraph, request.reconstructedGraph);
  violations.push(...structuralViolations);

  // 2. Accessibility diffing
  const a11yViolations = accessibilityDiff(request.originalGraph, request.reconstructedGraph);
  violations.push(...a11yViolations);

  // 3. Visual diffing
  // Build masks based on graph nodes
  const maskRegions: MaskRegion[] = [];
  const dynamicRoles = ['carousel', 'banner', 'video', 'ad'];
  const dynamicTags = ['VIDEO', 'IFRAME', 'CANVAS', 'IMG', 'SVG', 'PICTURE', 'FIGURE', 'ARTICLE'];

  if (request.originalGraph && request.originalGraph.nodes) {
    const geoNodes = request.originalGraph.nodes.filter((n: any) => n.type === 'GeometryNode');
    const domNodes = request.originalGraph.nodes.filter((n: any) => n.type === 'DOMNode');
    const a11yNodes = request.originalGraph.nodes.filter((n: any) => n.type === 'A11yNode');
    
    geoNodes.forEach((geo: any) => {
      // Find associated DOM node via edges
      const edge = request.originalGraph.edges.find((e: any) => e.target === geo.id && e.type === 'HAS_GEOMETRY');
      if (edge) {
        const dom = domNodes.find((n: any) => n.id === edge.source);
        const a11yEdge = request.originalGraph.edges.find((e: any) => e.source === edge.source && e.type === 'HAS_A11Y');
        const a11y = a11yEdge ? a11yNodes.find((n: any) => n.id === a11yEdge.target) : null;
        
        const tagName = dom?.properties?.tagName?.toUpperCase();
        const role = a11y?.properties?.role?.toLowerCase();
        
        let isDynamic = false;
        
        if (tagName && dynamicTags.includes(tagName)) isDynamic = true;
        if (role && dynamicRoles.includes(role)) isDynamic = true;
        // check custom data attributes or classes
        if (dom?.properties?.classes?.includes('dynamic-content')) isDynamic = true;

        if (isDynamic) {
          maskRegions.push({
            x: geo.properties.x || geo.properties.left || 0,
            y: geo.properties.y || geo.properties.top || 0,
            width: geo.properties.width || 0,
            height: geo.properties.height || 0,
            isDynamic: true
          });
        }
      }
    });
  }


  // Bounding Box and Color (DeltaE) Verification
  if (request.originalGraph && request.reconstructedGraph) {
    const origGeoNodes = request.originalGraph.nodes.filter((n: any) => n.type === 'GeometryNode');
    const reconGeoNodes = request.reconstructedGraph.nodes.filter((n: any) => n.type === 'GeometryNode');
    
    const origStyleNodes = request.originalGraph.nodes.filter((n: any) => n.type === 'StyleNode');
    const reconStyleNodes = request.reconstructedGraph.nodes.filter((n: any) => n.type === 'StyleNode');

    const origDomToGeo = new Map();
    const origDomToStyle = new Map();
    request.originalGraph.edges.forEach((e: any) => {
       if (e.type === 'HAS_GEOMETRY') origDomToGeo.set(e.source, e.target);
       if (e.type === 'HAS_STYLE') origDomToStyle.set(e.source, e.target);
    });
    
    const reconDomToGeo = new Map();
    const reconDomToStyle = new Map();
    request.reconstructedGraph.edges.forEach((e: any) => {
       if (e.type === 'HAS_GEOMETRY') reconDomToGeo.set(e.source, e.target);
       if (e.type === 'HAS_STYLE') reconDomToStyle.set(e.source, e.target);
    });

    const origDomNodes = request.originalGraph.nodes.filter((n: any) => n.type === 'DOMNode');
    const reconDomNodes = request.reconstructedGraph.nodes.filter((n: any) => n.type === 'DOMNode');

    origDomNodes.forEach((origDom: any) => {
       const reconDom = reconDomNodes.find((n: any) => n.id === origDom.id);
       if (reconDom) {
          const origGeoId = origDomToGeo.get(origDom.id);
          const reconGeoId = reconDomToGeo.get(reconDom.id);
          const origGeo = origGeoNodes.find((n: any) => n.id === origGeoId);
          const reconGeo = reconGeoNodes.find((n: any) => n.id === reconGeoId);
          if (origGeo && reconGeo) {
             const dx = Math.abs((origGeo.properties.x || 0) - (reconGeo.properties.x || 0));
             const dy = Math.abs((origGeo.properties.y || 0) - (reconGeo.properties.y || 0));
             const dw = Math.abs((origGeo.properties.width || 0) - (reconGeo.properties.width || 0));
             const dh = Math.abs((origGeo.properties.height || 0) - (reconGeo.properties.height || 0));
             if (dx > 2 || dy > 2 || dw > 2 || dh > 2) {
                 violations.push({
                   type: 'Visual',
                   message: `Bounding box shifted > 2px for ${origDom.id}. dx:${dx}, dy:${dy}, dw:${dw}, dh:${dh}`
                 });
             }
          }
          
          const origStyleId = origDomToStyle.get(origDom.id);
          const reconStyleId = reconDomToStyle.get(reconDom.id);
          const origStyle = origStyleNodes.find((n: any) => n.id === origStyleId);
          const reconStyle = reconStyleNodes.find((n: any) => n.id === reconStyleId);
          if (origStyle && reconStyle) {
             const origBg = origStyle.properties.backgroundColor;
             const reconBg = reconStyle.properties.backgroundColor;
             if (origBg && reconBg) {
                const de = calculateColorDeltaE(origBg, reconBg);
                if (de !== null && de > 2.0) {
                   violations.push({
                     type: 'Visual',
                     message: `BackgroundColor DeltaE > 2.0 for ${origDom.id}. de:${de.toFixed(2)}`
                   });
                }
             }
             
             const origColor = origStyle.properties.color;
             const reconColor = reconStyle.properties.color;
             if (origColor && reconColor) {
                const de = calculateColorDeltaE(origColor, reconColor);
                if (de !== null && de > 2.0) {
                   violations.push({
                     type: 'Visual',
                     message: `Color DeltaE > 2.0 for ${origDom.id}. de:${de.toFixed(2)}`
                   });
                }
             }
          }
       }
    });
  }

  const visualResult = visualDiff(request.originalScreenshotBase64, request.reconstructedScreenshotBase64, maskRegions);
  
  // Use adaptive thresholds. If there are many dynamic regions, we might tolerate slightly more error.
  let targetSsim = 0.98;
  let targetMse = 0.05;
  if (maskRegions.length > 5) {
      targetSsim = 0.95;
      targetMse = 0.10;
  }
  
  // Apply visual thresholds
  if (visualResult.ssim < targetSsim) {
    violations.push({
      type: 'Visual',
      message: `SSIM (${visualResult.ssim.toFixed(4)}) is below threshold (${targetSsim})`
    });
  }
  
  if (visualResult.mse > targetMse) {
    violations.push({
      type: 'Visual',
      message: `MSE (${visualResult.mse.toFixed(4)}) is above threshold (${targetMse})`
    });
  }

  const status: 'ValidationPassed' | 'ValidationFailed' = violations.length === 0 ? 'ValidationPassed' : 'ValidationFailed';

  const report = {
    status,
    ssim: visualResult.ssim,
    mse: visualResult.mse,
    violations
  };

  try {
    const evidenceDir = path.resolve(process.cwd(), 'logs', 'evidence');
    if (!fs.existsSync(evidenceDir)) {
      fs.mkdirSync(evidenceDir, { recursive: true });
    }
    const filename = `validation-${Date.now()}-${Math.floor(Math.random() * 1000)}.json`;
    fs.writeFileSync(path.join(evidenceDir, filename), JSON.stringify(report, null, 2));
  } catch (e) {
    console.error('Failed to write validation evidence', e);
  }

  return report;
}
