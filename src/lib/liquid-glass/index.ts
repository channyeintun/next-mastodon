/**
 * Liquid Glass Effect Library
 * Based on Apple's WWDC 2025 Liquid Glass design
 */

export {
    calculateDisplacementMap,
    calculateDisplacementMapWithShape,
    type ShapeType,
} from './displacementMap';

export { calculateRefractionSpecular } from './specular';

export { calculateMagnifyingDisplacementMap } from './magnifyingDisplacement';

export {
    CONVEX,
    CONVEX_CIRCLE,
    CONCAVE,
    LIP,
    type SurfaceFnDef,
} from './surfaceEquations';

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const imageDataToDataUrl = (imageData: ImageData): string => {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
};
