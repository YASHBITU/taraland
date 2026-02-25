import React from 'react';
import { AssetData } from '../../hooks/useMarketData';

interface TickerProps {
    assets: AssetData[];
}

export const MarketTicker: React.FC<TickerProps> = ({ assets }) => {
    return (
        <div className="w-full border-y border-white/5 bg-bg-secondary/90 overflow-hidden py-3 lg:py-4 relative shadow-none lg:shadow-[0_0_50px_rgba(0,0,0,0.5)] flex">
            <div className="absolute inset-y-0 left-0 w-8 lg:w-32 bg-gradient-to-r from-bg-primary via-bg-primary/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-8 lg:w-32 bg-gradient-to-l from-bg-primary via-bg-primary/80 to-transparent z-10 pointer-events-none" />

            <div className="flex w-max animate-ticker hover:[animation-play-state:paused] pointer-events-auto">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center font-mono text-xs lg:text-sm tracking-wider">
                        {assets.map((a, idx) => (
                            <React.Fragment key={idx}>
                                <div className="flex gap-2 lg:gap-4 items-center px-6 lg:px-12 group cursor-default">
                                    <span className="text-text-secondary font-semibold hover:text-white transition-colors">{a.symbol}</span>
                                    <span className={`text-white transition-colors duration-300 ${Date.now() - a.pulseTime < 500 ? (a.isUp ? 'text-emerald-300' : 'text-red-300') : ''}`}>
                                        {a.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-sm bg-black/50 ${a.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {a.change >= 0 ? '+' : ''}{a.change.toFixed(2)}%
                                    </span>
                                </div>
                                {(idx !== assets.length - 1 || i !== 3) && <div className="w-px h-4 lg:h-5 bg-white/10" />}
                            </React.Fragment>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};
