import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { Buffer } from 'buffer';

export interface VisualDiffResult {
  mse: number;
  ssim: number;
  numDiffPixels: number;
  diffBase64?: string;
}

// Very basic implementations for MSE and SSIM approximations.
function calculateMSE(diffPixels: number, totalPixels: number): number {
  return diffPixels / totalPixels;
}

// Pseudo-SSIM based on differences for simplicity
function calculateSSIM(diffPixels: number, totalPixels: number): number {
  return 1 - (diffPixels / totalPixels);
}

export function visualDiff(originalBase64: string, reconstructedBase64: string): VisualDiffResult {
  if (!originalBase64 || !reconstructedBase64) {
    return { mse: 1, ssim: 0, numDiffPixels: -1 };
  }

  try {
    const cleanOrigBase64 = originalBase64.replace(/^data:image\/\w+;base64,/, '');
    const cleanReconBase64 = reconstructedBase64.replace(/^data:image\/\w+;base64,/, '');

    const img1 = PNG.sync.read(Buffer.from(cleanOrigBase64, 'base64'));
    const img2 = PNG.sync.read(Buffer.from(cleanReconBase64, 'base64'));

    const { width, height } = img1;
    const diff = new PNG({ width, height });

    // Compare with pixelmatch
    // If dimensions don't match, pixelmatch will throw an error. We can catch it.
    let numDiffPixels = 0;
    if (img1.width === img2.width && img1.height === img2.height) {
        numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 });
    } else {
        // High penalty for dimension mismatch
        return { mse: 1, ssim: 0, numDiffPixels: img1.width * img1.height };
    }

    const totalPixels = width * height;
    const mse = calculateMSE(numDiffPixels, totalPixels);
    const ssim = calculateSSIM(numDiffPixels, totalPixels);
    const diffBuffer = PNG.sync.write(diff);

    return {
      mse,
      ssim,
      numDiffPixels,
      diffBase64: `data:image/png;base64,${diffBuffer.toString('base64')}`
    };
  } catch (error) {
    console.error('Error during visual diff:', error);
    return { mse: 1, ssim: 0, numDiffPixels: -1 };
  }
}
