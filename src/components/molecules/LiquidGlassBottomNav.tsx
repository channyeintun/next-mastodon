'use client';

import React, { useEffect, useState, useRef } from 'react';
import { LiquidGlassFilter } from '@/components/atoms';
import { lerp } from '@/lib/liquid-glass';
import { useIsIOS } from '@/hooks/useIsIOS';
import { NavigationLink } from './Navigation'; // We will export this from Navigation.tsx

interface LiquidGlassBottomNavProps {
    bottomNavLinks: Array<{
        href: string;
        label: string;
        icon: React.ComponentType<{ size: number }>;
        badge?: number;
    }>;
    pathname: string;
}

export function LiquidGlassBottomNav({ bottomNavLinks, pathname }: LiquidGlassBottomNavProps) {
    const [dimensions, setDimensions] = useState({ width: 0, height: 56 });
    const [itemWidth, setItemWidth] = useState(0);
    const [isPressed, setIsPressed] = useState(false);
    const isIOS = useIsIOS();

    const activeIndex = bottomNavLinks.findIndex(link => link.href === pathname);
    const initialIndex = activeIndex >= 0 ? activeIndex : 0;

    const [thumbState, setThumbState] = useState({
        x: initialIndex,
        wobbleX: 1,
        wobbleY: 1
    });

    const physicsRef = useRef({
        currentX: initialIndex,
        targetX: initialIndex,
        velocity: 0,
        wobbleX: 1,
        wobbleY: 1,
        lastTime: 0
    });

    const bgFilterId = 'liquid-glass-bottom-nav-bg';
    const thumbFilterId = 'liquid-glass-bottom-nav-thumb';

    const pressScale = isPressed ? 1.2 : 1;
    const pressScaleY = isPressed ? 1.1 : 1;

    const PILL_PADDING = 8;
    // We keep itemWidth for the filter generation which needs exact pixels
    const thumbWidth = itemWidth > 0 ? (itemWidth - (PILL_PADDING * 2)) : 0;

    const pillRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!pillRef.current) return;

        const updateDimensions = () => {
            if (pillRef.current) {
                const width = pillRef.current.offsetWidth;
                const height = pillRef.current.offsetHeight;
                setDimensions({ width, height });
                setItemWidth(width / bottomNavLinks.length);
            }
        };

        updateDimensions();
        const resizeObserver = new ResizeObserver(updateDimensions);
        resizeObserver.observe(pillRef.current);
        return () => resizeObserver.disconnect();
    }, [bottomNavLinks.length]);

    useEffect(() => {
        if (activeIndex >= 0) {
            physicsRef.current.targetX = activeIndex;
        }
    }, [activeIndex]);

    useEffect(() => {
        let rafId: number;

        // Tuning for index-based movement (approx 100x smaller units than pixels)
        // Previous pixel-based: velocity ~10-100. Factor 0.12.
        // New index-based: velocity ~0.1-1.0. Factor needs to be higher for same effect.
        // Let's try 12.0
        const WOBBLE_FACTOR = 12.0;

        const loop = () => {
            const p = physicsRef.current;
            const newX = lerp(p.currentX, p.targetX, 0.22);
            p.velocity = newX - p.currentX;
            p.currentX = newX;

            const stretchFactor = 1 + Math.abs(p.velocity) * WOBBLE_FACTOR;
            const squashFactor = 1 / stretchFactor;

            p.wobbleX = lerp(p.wobbleX, stretchFactor, 0.3);
            p.wobbleY = lerp(p.wobbleY, squashFactor, 0.3);

            if (Math.abs(p.targetX - p.currentX) < 0.001 && Math.abs(p.wobbleX - 1) < 0.001) {
                p.currentX = p.targetX;
                p.wobbleX = 1;
                p.wobbleY = 1;
                p.velocity = 0;
            }

            setThumbState({
                x: p.currentX,
                wobbleX: p.wobbleX,
                wobbleY: p.wobbleY
            });
            rafId = requestAnimationFrame(loop);
        };
        rafId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafId);
    }, []);

    const handlePointerDown = () => setIsPressed(true);
    const handlePointerUp = () => setIsPressed(false);

    const itemCount = bottomNavLinks.length;
    const itemPercentage = 100 / itemCount;

    return (
        <nav className="navigation-bottom" aria-label="Mobile navigation">
            <div ref={pillRef} className="navigation-bottom-pill-wrapper">
                {dimensions.width > 0 && !isIOS && (
                    <LiquidGlassFilter
                        id={bgFilterId}
                        width={dimensions.width}
                        height={dimensions.height}
                        radius={28}
                        bezelWidth={24}
                        blur={0.3}
                        scaleRatio={1.2}
                        cornerRadius={1.0}
                        shape="pill"
                        bezelType="convex_squircle"
                        specularOpacity={0.3}
                        specularSaturation={1.2}
                    />
                )}

                {thumbWidth > 0 && !isIOS && (
                    <LiquidGlassFilter
                        id={thumbFilterId}
                        width={thumbWidth}
                        height={48}
                        radius={24}
                        bezelWidth={16}
                        blur={0.3}
                        scaleRatio={0.8}
                        cornerRadius={1.0}
                        shape="pill"
                        bezelType="lip"
                        specularOpacity={0.4}
                        specularSaturation={1.5}
                    />
                )}

                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 28,
                        backdropFilter: isIOS ? 'blur(20px)' : `url(#${bgFilterId})`,
                        WebkitBackdropFilter: isIOS ? 'blur(20px)' : `url(#${bgFilterId})`,
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '0.5px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                    }}
                />

                {activeIndex >= 0 && (
                    <div
                        className="navigation-bottom-thumb"
                        style={{
                            position: 'absolute',
                            height: 48,
                            width: `${itemPercentage}%`,
                            top: '50%',
                            marginTop: -24, // Vertically centered (48px height)
                            left: 0,
                            transform: `translateX(${thumbState.x * 100}%) scale(${thumbState.wobbleX * pressScale}, ${thumbState.wobbleY * pressScaleY})`,
                            zIndex: 2,
                            pointerEvents: 'none',
                        }}
                    >
                        <div
                            style={{
                                width: `calc(100% - ${PILL_PADDING * 2}px)`,
                                height: '100%',
                                margin: `0 auto`,
                                borderRadius: 24,
                                backdropFilter: isIOS ? 'blur(10px)' : `url(#${thumbFilterId})`,
                                WebkitBackdropFilter: isIOS ? 'blur(10px)' : `url(#${thumbFilterId})`,
                                background: isPressed ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.18)',
                                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
                                border: '0.5px solid rgba(255, 255, 255, 0.25)',
                                transition: 'background 0.1s ease',
                            }}
                        />
                    </div>
                )}

                <div
                    className="navigation-bottom-content"
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp}
                    style={{
                        position: 'relative',
                        zIndex: 10,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        height: '100%',
                    }}
                >
                    {bottomNavLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <NavigationLink
                                key={link.href}
                                href={link.href}
                                icon={Icon}
                                label={link.label}
                                isActive={isActive}
                                variant="bottom"
                                badge={link.badge}
                            />
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
