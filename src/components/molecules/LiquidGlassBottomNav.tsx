'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { LiquidGlassFilter } from '@/components/atoms';
import { lerp } from '@/lib/liquid-glass';
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

    const [thumbState, setThumbState] = useState({
        x: 0,
        wobbleX: 1,
        wobbleY: 1
    });

    const physicsRef = useRef({
        currentX: 0,
        targetX: 0,
        velocity: 0,
        wobbleX: 1,
        wobbleY: 1,
        lastTime: 0
    });

    const bgFilterId = 'liquid-glass-bottom-nav-bg';
    const thumbFilterId = 'liquid-glass-bottom-nav-thumb';

    const pressScale = isPressed ? 1.2 : 1;
    const pressScaleY = isPressed ? 1.1 : 1;

    const activeIndex = bottomNavLinks.findIndex(link => link.href === pathname);
    const PILL_PADDING = 8;
    const thumbWidth = itemWidth > 0 ? (itemWidth - (PILL_PADDING * 2)) : 48;

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
        if (activeIndex >= 0 && itemWidth > 0) {
            const targetX = activeIndex * itemWidth + (itemWidth - thumbWidth) / 2;
            physicsRef.current.targetX = targetX;
        }
    }, [activeIndex, itemWidth, thumbWidth]);

    useEffect(() => {
        let rafId: number;
        const loop = () => {
            const p = physicsRef.current;
            const newX = lerp(p.currentX, p.targetX, 0.22);
            p.velocity = newX - p.currentX;
            p.currentX = newX;

            const stretchFactor = 1 + Math.abs(p.velocity) * 0.12;
            const squashFactor = 1 / stretchFactor;

            p.wobbleX = lerp(p.wobbleX, stretchFactor, 0.3);
            p.wobbleY = lerp(p.wobbleY, squashFactor, 0.3);

            if (Math.abs(p.targetX - p.currentX) < 0.01 && Math.abs(p.wobbleX - 1) < 0.001) {
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

    return (
        <nav className="navigation-bottom" aria-label="Mobile navigation">
            <Link href="/search" className="navigation-bottom-search-circle" aria-label="Search">
                <Search size={24} />
            </Link>

            <div ref={pillRef} className="navigation-bottom-pill-wrapper">
                {dimensions.width > 0 && (
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

                {thumbWidth > 0 && (
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
                        backdropFilter: `url(#${bgFilterId})`,
                        WebkitBackdropFilter: `url(#${bgFilterId})`,
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '0.5px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                    }}
                />

                {thumbWidth > 0 && activeIndex >= 0 && (
                    <div
                        className="navigation-bottom-thumb"
                        style={{
                            position: 'absolute',
                            height: 48,
                            width: thumbWidth,
                            top: (dimensions.height - 48) / 2,
                            left: 0,
                            transform: `translateX(${thumbState.x}px) scale(${thumbState.wobbleX * pressScale}) scaleY(${thumbState.wobbleY * pressScaleY})`,
                            zIndex: 2,
                            pointerEvents: 'none',
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                inset: 0,
                                borderRadius: 24,
                                backdropFilter: `url(#${thumbFilterId})`,
                                WebkitBackdropFilter: `url(#${thumbFilterId})`,
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
