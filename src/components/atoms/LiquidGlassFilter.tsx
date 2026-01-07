'use client';

import React, { useMemo } from 'react';
import {
    calculateDisplacementMap,
    calculateDisplacementMapWithShape,
    type ShapeType
} from '@/lib/liquid-glass/displacementMap';
import { calculateRefractionSpecular } from '@/lib/liquid-glass/specular';
import { CONVEX, CONCAVE, CONVEX_CIRCLE, LIP } from '@/lib/liquid-glass/surfaceEquations';

interface LiquidGlassFilterProps {
    id: string;
    width?: number;
    height?: number;
    radius?: number;
    bezelWidth?: number;
    glassThickness?: number;
    refractiveIndex?: number;
    bezelType?: 'convex_circle' | 'convex_squircle' | 'concave' | 'lip';
    blur?: number;
    scaleRatio?: number;
    specularOpacity?: number;
    specularSaturation?: number;
    shape?: ShapeType;
    cornerRadius?: number; // 0 to 1
    squircleExponent?: number;
}

function imageDataToDataUrl(imageData: ImageData): string {
    if (typeof document === 'undefined') return '';
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png');
}

function getSurfaceFn(bezelType: string) {
    switch (bezelType) {
        case 'convex_circle': return CONVEX_CIRCLE.fn;
        case 'convex_squircle': return CONVEX.fn;
        case 'concave': return CONCAVE.fn;
        case 'lip': return LIP.fn;
        default: return CONVEX.fn;
    }
}

export function LiquidGlassFilter({
    id,
    width = 150,
    height = 150,
    radius = 75,
    bezelWidth = 40,
    glassThickness = 120,
    refractiveIndex = 1.5,
    bezelType = 'convex_squircle',
    blur = 0.2,
    scaleRatio = 1,
    specularOpacity = 0.4,
    specularSaturation = 4,
    shape = 'pill',
    cornerRadius = 1.0,
    squircleExponent = 2,
}: LiquidGlassFilterProps) {

    const { displacementMapUrl, specularMapUrl, scale } = useMemo(() => {
        if (typeof window === 'undefined') return { displacementMapUrl: '', specularMapUrl: '', scale: 0 };

        const surfaceFn = getSurfaceFn(bezelType);
        const precomputedMap = calculateDisplacementMap(
            glassThickness,
            bezelWidth,
            surfaceFn,
            refractiveIndex
        );

        const maxDisp = Math.max(...precomputedMap.map(x => Math.abs(x))) || 1;
        const currentScale = maxDisp * scaleRatio;

        const displacementImageData = calculateDisplacementMapWithShape(
            width,
            height,
            width,
            height,
            bezelWidth,
            maxDisp,
            precomputedMap,
            shape,
            cornerRadius,
            squircleExponent
        );

        const specularImageData = calculateRefractionSpecular(
            width,
            height,
            radius,
            bezelWidth
        );

        return {
            displacementMapUrl: imageDataToDataUrl(displacementImageData),
            specularMapUrl: imageDataToDataUrl(specularImageData),
            scale: currentScale
        };
    }, [width, height, radius, bezelWidth, glassThickness, refractiveIndex, bezelType, scaleRatio, shape, cornerRadius, squircleExponent]);

    return (
        <svg colorInterpolationFilters="sRGB" style={{ display: 'none' }} aria-hidden="true">
            <defs>
                <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
                    {/* Blur phase */}
                    <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blurred_source" />

                    {/* Displacement phase */}
                    {displacementMapUrl && (
                        <>
                            <feImage href={displacementMapUrl} x="0" y="0" width={width} height={height} result="displacement_map" />
                            <feDisplacementMap in="blurred_source" in2="displacement_map" scale={scale} xChannelSelector="R" yChannelSelector="G" result="displaced" />
                        </>
                    )}

                    {/* Saturation phase */}
                    <feColorMatrix in="displaced" type="saturate" values={specularSaturation.toString()} result="displaced_saturated" />

                    {/* Specular layer phase */}
                    {specularMapUrl && (
                        <>
                            <feImage href={specularMapUrl} x="0" y="0" width={width} height={height} result="specular_layer" />
                            <feComposite in="displaced_saturated" in2="specular_layer" operator="in" result="specular_saturated" />
                            <feComponentTransfer in="specular_layer" result="specular_faded">
                                <feFuncA type="linear" slope={specularOpacity} />
                            </feComponentTransfer>
                        </>
                    )}

                    {/* Final blending phase */}
                    <feBlend in="specular_saturated" in2="displaced" mode="normal" result="withSaturation" />
                    <feBlend in="specular_faded" in2="withSaturation" mode="normal" />
                </filter>
            </defs>
        </svg>
    );
}
