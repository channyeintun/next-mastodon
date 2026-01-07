'use client';

import React, { useEffect, useState, useRef } from 'react';
import { LiquidGlassFilter } from '@/components/atoms';
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

    const bgFilterId = 'liquid-glass-bottom-nav-bg';
    const thumbFilterId = 'liquid-glass-bottom-nav-thumb';

    const pressScale = isPressed ? 1.2 : 1;
    const pressScaleY = isPressed ? 1.1 : 1;

    const activeIndex = bottomNavLinks.findIndex(link => link.href === pathname);

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
                            transform: `translateX(${activeIndex * 100}%)`,
                            zIndex: 2,
                            pointerEvents: 'none',
                            transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
                        }}
                    >
                        <div
                            key={activeIndex} // Trigger animation on index change
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
                                transform: `scale(${pressScale}, ${pressScaleY})`,
                                animation: 'wobble-stretch 0.5s ease-out',
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
