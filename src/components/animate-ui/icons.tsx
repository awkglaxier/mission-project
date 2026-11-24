/**
 * Animated icons adapted from Animate UI (https://animate-ui.com)
 * Lucide Settings and Volume 2 icon animations (MIT License).
 */
import { motion, type Variants } from 'motion/react';
import { useAnimatedIconActive } from './icon-context';

const settingsVariants = {
    initial: { rotate: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
    animate: {
        rotate: [0, 90, 180],
        transition: { duration: 1.25, ease: 'easeInOut' },
    },
} satisfies Variants;

interface IconProps {
    size?: number;
    className?: string;
}

export function AnimatedSettingsIcon({ size = 16, className }: IconProps) {
    const active = useAnimatedIconActive();

    return (
        <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={settingsVariants}
            initial="initial"
            animate={active ? 'animate' : 'initial'}
            className={className}
            aria-hidden="true"
        >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx={12} cy={12} r={3} />
        </motion.svg>
    );
}

const makeVolumeVariants = (index: number): Variants => ({
    initial: { opacity: 1, scale: 1 },
    animate: {
        opacity: [1, 0.25, 1],
        scale: [1, 0.85, 1],
        transition: {
            duration: 0.5,
            ease: 'easeInOut',
            delay: 0.15 * index,
        },
    },
});

const volumeVariants = [makeVolumeVariants(0), makeVolumeVariants(1)];

export function AnimatedVolumeIcon({ size = 20, className }: IconProps) {
    const active = useAnimatedIconActive();

    return (
        <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial="initial"
            animate={active ? 'animate' : 'initial'}
            className={className}
            aria-hidden="true"
        >
            <motion.path d="M16 9a5 5 0 0 1 0 6" variants={volumeVariants[0]} />
            <motion.path d="M19.364 18.364a9 9 0 0 0 0-12.728" variants={volumeVariants[1]} />
            <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
        </motion.svg>
    );
}
