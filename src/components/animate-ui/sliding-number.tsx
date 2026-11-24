/**
 * Sliding Number — adapted from Animate UI (https://animate-ui.com)
 * Source: registry/primitives/texts/sliding-number (MIT License).
 * Simplified for React 18 and integer values, with Thai font metrics handled
 * by measuring the rendered digit height.
 */
import { useEffect, useRef, useState } from 'react';
import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
    type MotionValue,
    type SpringOptions,
} from 'motion/react';
import useMeasure from 'react-use-measure';

const DEFAULT_TRANSITION: SpringOptions = { stiffness: 200, damping: 20, mass: 0.4 };

interface RollerProps {
    number: number;
    height: number;
    motionValue: MotionValue<number>;
}

function Roller({ number, height, motionValue }: RollerProps) {
    const y = useTransform(motionValue, (latest) => {
        const offset = (10 + number - (latest % 10)) % 10;
        let translateY = offset * height;
        if (offset > 5) translateY -= 10 * height;
        return translateY;
    });

    return (
        <motion.span
            data-slot="sliding-number-display"
            style={{
                y,
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            transition={{ type: 'spring' }}
        >
            {number}
        </motion.span>
    );
}

interface DigitProps {
    place: number;
    prevValue: number;
    value: number;
    transition: SpringOptions;
    delay: number;
}

function Digit({ place, prevValue, value, transition, delay }: DigitProps) {
    const startNumber = Math.floor(prevValue / place) % 10;
    const targetNumber = Math.floor(value / place) % 10;
    const animatedValue = useSpring(startNumber, transition);

    useEffect(() => {
        const timeoutId = setTimeout(() => animatedValue.set(targetNumber), delay);
        return () => clearTimeout(timeoutId);
    }, [targetNumber, animatedValue, delay]);

    const [measureRef, { height }] = useMeasure();

    return (
        <span
            ref={measureRef}
            data-slot="sliding-number-roller"
            className="relative inline-block w-[1ch] overflow-y-clip text-center leading-none tabular-nums"
        >
            <span className="invisible" aria-hidden="true">
                0
            </span>
            {height > 0 &&
                Array.from({ length: 10 }, (_, i) => (
                    <Roller key={i} number={i} height={height} motionValue={animatedValue} />
                ))}
        </span>
    );
}

export interface SlidingNumberProps {
    number: number;
    fromNumber?: number;
    delay?: number;
    transition?: SpringOptions;
    className?: string;
}

export function SlidingNumber({
    number,
    fromNumber = 0,
    delay = 0,
    transition = DEFAULT_TRANSITION,
    className = '',
}: SlidingNumberProps) {
    const motionValue = useMotionValue(fromNumber);
    const springValue = useSpring(motionValue, { stiffness: 90, damping: 50 });
    const [displayValue, setDisplayValue] = useState(fromNumber);
    const previousRef = useRef(fromNumber);

    useEffect(() => {
        const unsubscribe = springValue.on('change', (latest) => {
            setDisplayValue(Math.round(latest));
        });
        return () => unsubscribe();
    }, [springValue]);

    useEffect(() => {
        const timeoutId = setTimeout(() => motionValue.set(number), delay);
        return () => clearTimeout(timeoutId);
    }, [number, motionValue, delay]);

    useEffect(() => {
        previousRef.current = displayValue;
    }, [displayValue]);

    const intString = String(Math.abs(displayValue));
    const places = Array.from({ length: intString.length }, (_, i) =>
        Math.pow(10, intString.length - i - 1),
    );

    return (
        <span className={`inline-flex items-center ${className}`}>
            <span className="sr-only">{number}</span>
            <span aria-hidden="true" className="inline-flex items-center">
                {places.map((place) => (
                    <Digit
                        key={`${places.length}-${place}`}
                        place={place}
                        prevValue={previousRef.current}
                        value={displayValue}
                        transition={transition}
                        delay={0}
                    />
                ))}
            </span>
        </span>
    );
}
