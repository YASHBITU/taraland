import React, { useState, useEffect, useMemo } from 'react';
import { ComposedChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';

interface TerminalChartProps {
    symbol: string;
    timeframe?: string;
}

// Map internal timeframe constants to Binance interval strings
const mapTimeframeToInterval = (tf: string) => {
    switch (tf) {
        case 'M1': return '1m';
        case 'M5': return '5m';
        case 'M15': return '15m';
        case 'H1': return '1h';
        case 'D1': return '1d';
        default: return '1m';
    }
};

interface ChartData {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

// Map internal symbols to Binance pairs for klines
const mapSymbolToBinance = (symbol: string) => {
    if (symbol === 'BTC/USD') return 'BTCUSDT';
    if (symbol === 'ETH/USD') return 'ETHUSDT';
    if (symbol === 'XAU/USD') return 'PAXGUSDT'; // Best gold proxy on Binance
    return 'BTCUSDT'; // Fallback
};

// Custom shape for candlestick inside Recharts Bar component
const CandlestickShape = (props: any) => {
    const { x, y, width, height, open, close, high, low, fill } = props;

    // To calculate wick positions we need access to the Y axis scaling
    // Recharts custom shapes can get complex if relying heavily on coordinate math without Y axis
    // However, props.y and props.height map exactly to 'max(open, close)' and 'min(open,close)' if configured right.
    // We'll configure our Bar to span [low, high] and visually draw the body using Open and Close!

    // That means `y` is the High coordinate, `height` spans High to Low.
    // We need the raw data ratios to draw the body within this container.

    const h = Math.max(height, 1);
    const totalRange = high - low || 1;
    const ratio = h / totalRange;

    const yOpen = y + (high - open) * ratio;
    const yClose = y + (high - close) * ratio;

    const bodyTop = Math.min(yOpen, yClose);
    const bodyBottom = Math.max(yOpen, yClose);
    const bodyHeight = Math.max(bodyBottom - bodyTop, 1);

    const center = x + width / 2;

    return (
        <g>
            {/* Wick */}
            <line x1={center} y1={y} x2={center} y2={y + h} stroke={fill} strokeWidth={1} />
            {/* Body */}
            <rect x={x} y={bodyTop} width={width} height={bodyHeight} fill={fill} stroke={fill} />
        </g>
    );
};

export const TerminalChart: React.FC<TerminalChartProps> = ({ symbol, timeframe = 'M1' }) => {
    const [data, setData] = useState<ChartData[]>([]);

    useEffect(() => {
        let active = true;

        // Show synchronizing loading state whenever timeframe swaps natively
        setData([]);

        const fetchKlines = async () => {
            try {
                const fetchSymbol = mapSymbolToBinance(symbol);
                const intervalStr = mapTimeframeToInterval(timeframe);
                // Dynamically apply Binance klines interval mapped from parent prop
                const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${fetchSymbol}&interval=${intervalStr}&limit=40`);
                const json = await res.json();

                if (!active) return;

                const formatted = json.map((d: any) => ({
                    time: d[0],
                    open: parseFloat(d[1]),
                    high: parseFloat(d[2]),
                    low: parseFloat(d[3]),
                    close: parseFloat(d[4]),
                    volume: parseFloat(d[5]),
                    // specific array structure required to render low,high bounds in Recharts
                    wickBounds: [parseFloat(d[3]), parseFloat(d[2])]
                }));

                setData(formatted);
            } catch (err) {
                console.error("Failed to fetch klines:", err);
            }
        };

        fetchKlines();
        const interval = setInterval(fetchKlines, 10000); // Poll every 10s

        return () => {
            active = false;
            clearInterval(interval);
        };
    }, [symbol, timeframe]);

    const [domainMin, domainMax] = useMemo(() => {
        if (data.length === 0) return [0, 0];
        const lows = data.map(d => d.low);
        const highs = data.map(d => d.high);
        // Add 10% vertical padding
        const min = Math.min(...lows);
        const max = Math.max(...highs);
        const diff = max - min;
        return [min - diff * 0.1, max + diff * 0.1];
    }, [data]);

    if (data.length === 0) {
        return <div className="absolute inset-0 flex items-center justify-center text-text-secondary font-mono text-xs">SYNCHRONIZING SECURE TUNNEL...</div>;
    }

    return (
        <div className="absolute bottom-0 left-0 right-0 h-[65%] w-full z-[5] overflow-visible">
            {/* We overlay 2 charts manually to keep candlestick & volume separated cleanly in Recharts without extreme custom YAxis overlapping overhead */}

            {/* Volume Chart (Background) */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 opacity-30">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <Bar dataKey="volume" isAnimationActive={false}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.close >= entry.open ? '#10B981' : '#EF4444'} />
                            ))}
                        </Bar>
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Candlestick Chart (Foreground) */}
            <div className="absolute inset-0 pb-8">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <YAxis domain={[domainMin, domainMax]} hide />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0B0B0D', border: '1px solid #C6A84F', borderRadius: '8px' }}
                            itemStyle={{ color: '#F5F5F5', fontFamily: 'monospace' }}
                            cursor={{ stroke: 'rgba(198,168,79,0.2)', strokeWidth: 1, strokeDasharray: '3 3' }}
                            labelFormatter={() => ''}
                        />
                        {/* The Bar bounds the exact min and max (low and high) of the candle */}
                        <Bar dataKey="wickBounds" shape={<CandlestickShape />} isAnimationActive={false}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    // pass the raw data into the shape for body math
                                    {...entry}
                                    fill={entry.close >= entry.open ? '#10B981' : '#EF4444'}
                                />
                            ))}
                        </Bar>
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
