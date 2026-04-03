'use client';

import React, { useState, useEffect } from 'react';
import { useIsIOS } from '@/hooks/useIsIOS';
import { NavigationLink } from './Navigation';
import { refractive } from '@hashintel/refractive';

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
    const [isPressed, setIsPressed] = useState(false);
    const [mounted, setMounted] = useState(false);
    const isIOS = useIsIOS();

    useEffect(() => {
        setMounted(true);
    }, []);

    const pressScale = isPressed ? 1.2 : 1;
    const pressScaleY = isPressed ? 1.1 : 1;

    const activeIndex = bottomNavLinks.findIndex(link => link.href === pathname);
    const PILL_PADDING = 8;
    const itemCount = bottomNavLinks.length;
    const itemPercentage = 100 / itemCount;

    const handlePointerDown = () => setIsPressed(true);
    const handlePointerUp = () => setIsPressed(false);

    return (
        <nav className="navigation-bottom" aria-label="Mobile navigation">
            <div className="navigation-bottom-pill-wrapper">
                {(!isIOS && mounted) ? (
                    <refractive.div
                        className="glass-pill"
                        refraction={{
                            radius: 28,
                            bezelWidth: 24,
                            blur: 1.0,
                            specularOpacity: 0.4,
                            specularAngle: 1
                        }}
                    />
                ) : (
                    <div
                        className="glass-pill"
                        style={{
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            borderRadius: 28,
                        }}
                    />
                )}

                {activeIndex >= 0 && (
                    <div
                        className="navigation-bottom-thumb"
                        style={{
                            position: 'absolute',
                            height: 48,
                            width: `${itemPercentage}%`,
                            top: '50%',
                            marginTop: -24,
                            left: 0,
                            transform: `translateX(${activeIndex * 100}%)`,
                            zIndex: 2,
                            pointerEvents: 'none',
                            transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
                        }}
                    >
                        <div
                            className="glass-thumb"
                            key={activeIndex}
                            style={{
                                width: `calc(100% - ${PILL_PADDING * 2}px)`,
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                                background: isPressed ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.18)',
                                transform: `scale(${pressScale}, ${pressScaleY})`,
                                borderRadius: 24,
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
