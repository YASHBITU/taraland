import React, { useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

interface GlassCardProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    disable3DOnMobile?: boolean; // Perf optimization flag
    drag?: "x" | "y" | boolean;
    dragConstraints?: any;
    dragElastic?: number;
    onDragEnd?: any;
    animate?: any;
    transition?: any;
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    onClick,
    className = '',
    disable3DOnMobile = true,
    ...dragProps
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Use slightly stiffer springs for performance (less settling time)
    const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
    const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["6deg", "-6deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-6deg", "6deg"]);

    const [isMobile, setIsMobile] = React.useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile(); // Initial
        const handleResize = () => requestAnimationFrame(checkMobile); // Throttle resize
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isMobile && disable3DOnMobile) return;
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        x.set(mouseX / width - 0.5);
        y.set(mouseY / height - 0.5);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    const styleProps = (isMobile && disable3DOnMobile)
        ? {}
        : { rotateX, rotateY, transformStyle: "preserve-3d" as const };

    return (
        <motion.div
            ref={cardRef}
            style={styleProps}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            className={`relative glass-card transition-all duration-300 ${onClick ? 'cursor-pointer' : ''} ${className}`}
            whileTap={onClick ? { scale: 0.98 } : {}}
            {...dragProps}
        >
            {/* Optimized reflections using basic CSS opacity vs heavy filters */}
            <div className="absolute inset-0 rounded-2xl border border-gold-light/0 hover:border-gold-light/20 transition-colors pointer-events-none" style={(isMobile && disable3DOnMobile) ? {} : { transform: "translateZ(1px)" }} />
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" style={(isMobile && disable3DOnMobile) ? {} : { transform: "translateZ(10px)" }} />
            <div style={(isMobile && disable3DOnMobile) ? {} : { transform: "translateZ(20px)" }} className="h-full">
                {children}
            </div>
        </motion.div>
    );
};
