import { useState, type ReactNode } from 'react';
import { IconActiveContext } from './icon-context';

interface AnimateIconProps {
    children: ReactNode;
    className?: string;
}

/**
 * Lightweight stand-in for Animate UI's `AnimateIcon` (https://animate-ui.com)
 * that works with the project's React 18 setup. It toggles the animation
 * context on hover/tap so icons inside it can play their variants.
 */
export function AnimateIcon({ children, className = 'inline-flex' }: AnimateIconProps) {
    const [active, setActive] = useState(false);

    return (
        <IconActiveContext.Provider value={active}>
            <span
                className={className}
                onPointerEnter={(e) => {
                    if (e.pointerType !== 'touch') setActive(true);
                }}
                onPointerLeave={() => setActive(false)}
                onPointerDown={() => setActive(true)}
                onPointerUp={() => setActive(false)}
                onPointerCancel={() => setActive(false)}
            >
                {children}
            </span>
        </IconActiveContext.Provider>
    );
}
