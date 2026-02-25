import React, { useState, useEffect } from 'react';

interface AnimatedCounterProps {
    value: string | number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
    value,
    prefix = "",
    suffix = "",
    decimals = 0
}) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const rawVal = parseFloat(String(value).replace(/[^0-9.]/g, ''));
        let start = 0;
        const end = rawVal;
        const duration = 1500; // slightly faster for UX

        let startTime: number | null = null;
        let animationFrameId: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);

            // Easing out curve
            const easeOutQuart = 1 - Math.pow(1 - percentage, 4);

            setCount(start + (end - start) * easeOutQuart);

            if (percentage < 1) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrameId);
    }, [value]);

    const displayValue = count.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });

    let formatted = displayValue;
    if (String(value).includes('B')) formatted += 'B';
    return <>{prefix}{formatted}{suffix}</>;
};
