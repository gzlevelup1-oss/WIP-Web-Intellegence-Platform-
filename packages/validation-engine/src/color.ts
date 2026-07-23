export function parseColor(colorStr: string): {r: number, g: number, b: number, a: number} | null {
  if (!colorStr) return null;
  // Handle rgb/rgba
  const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
      a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1
    };
  }
  // Handle hex
  const hexMatch = colorStr.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i);
  if (hexMatch) {
    return {
      r: parseInt(hexMatch[1], 16),
      g: parseInt(hexMatch[2], 16),
      b: parseInt(hexMatch[3], 16),
      a: hexMatch[4] ? parseInt(hexMatch[4], 16) / 255 : 1
    };
  }
  // Named colors could go here, but for simplicity we return null
  return null;
}

export function rgbToXyz(r: number, g: number, b: number) {
  let [rr, gg, bb] = [r, g, b].map(x => {
    x = x / 255;
    return x > 0.04045 ? Math.pow((x + 0.055) / 1.055, 2.4) : x / 12.92;
  });
  rr *= 100; gg *= 100; bb *= 100;
  return {
    x: rr * 0.4124 + gg * 0.3576 + bb * 0.1805,
    y: rr * 0.2126 + gg * 0.7152 + bb * 0.0722,
    z: rr * 0.0193 + gg * 0.1192 + bb * 0.9505
  };
}

export function xyzToLab(x: number, y: number, z: number) {
  const ref_X =  95.047;
  const ref_Y = 100.000;
  const ref_Z = 108.883;
  let [xx, yy, zz] = [x / ref_X, y / ref_Y, z / ref_Z].map(v => {
    return v > 0.008856 ? Math.pow(v, 1/3) : (7.787 * v) + (16 / 116);
  });
  return {
    l: (116 * yy) - 16,
    a: 500 * (xx - yy),
    b: 200 * (yy - zz)
  };
}

export function deltaE(labA: {l:number, a:number, b:number}, labB: {l:number, a:number, b:number}) {
  const deltaL = labA.l - labB.l;
  const deltaA = labA.a - labB.a;
  const deltaB = labA.b - labB.b;
  const c1 = Math.sqrt(labA.a * labA.a + labA.b * labA.b);
  const c2 = Math.sqrt(labB.a * labB.a + labB.b * labB.b);
  const deltaC = c1 - c2;
  let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
  deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
  const sc = 1.0 + 0.045 * c1;
  const sh = 1.0 + 0.015 * c1;
  const deltaLKlsl = deltaL / (1.0);
  const deltaCkcsc = deltaC / sc;
  const deltaHkhsh = deltaH / sh;
  const i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
  return i < 0 ? 0 : Math.sqrt(i);
}

export function calculateColorDeltaE(color1: string, color2: string): number | null {
  const c1 = parseColor(color1);
  const c2 = parseColor(color2);
  if (!c1 || !c2) return null;
  const xyz1 = rgbToXyz(c1.r, c1.g, c1.b);
  const xyz2 = rgbToXyz(c2.r, c2.g, c2.b);
  const lab1 = xyzToLab(xyz1.x, xyz1.y, xyz1.z);
  const lab2 = xyzToLab(xyz2.x, xyz2.y, xyz2.z);
  return deltaE(lab1, lab2);
}
