// @ts-nocheck
import { useState, useEffect, useRef } from 'react';

export interface AssetData {
    symbol: string;
    price: number;
    change: number;
    isUp: boolean;
    pulseTime: number; // for individual pulse effects
}

// Fallback mock generator for indices to prevent rate-limit breaks
const generateWalk = (prevPrice: number, volatility: number) => {
    const changeAmt = prevPrice * volatility * (Math.random() > 0.45 ? 1 : -1);
    return prevPrice + changeAmt;
};

export const useMarketData = () => {
    const [assets, setAssets] = useState<AssetData[]>([
        { symbol: 'XAU/USD', price: 2145.42, change: 0.82, isUp: true, pulseTime: 0 },
        { symbol: 'BTC/USD', price: 63482.21, change: 1.24, isUp: true, pulseTime: 0 },
        { symbol: 'ETH/USD', price: 3412.55, change: 1.10, isUp: true, pulseTime: 0 },
        { symbol: 'SPX', price: 5214.10, change: 0.45, isUp: true, pulseTime: 0 },
        { symbol: 'DXY', price: 105.45, change: -0.12, isUp: false, pulseTime: 0 }
    ]);

    const [pulse, setPulse] = useState(false);

    useEffect(() => {
        let isSubscribed = true;

        const fetchMarketData = async () => {
            try {
                // We use Binance for Crypto & Gold (PAXG closely mirrors Gold)
                const [btcRes, ethRes, paxgRes] = await Promise.all([
                    fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT'),
                    fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=ETHUSDT'),
                    fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=PAXGUSDT')
                ]);

                const btc = await btcRes.json();
                const eth = await ethRes.json();
                const paxg = await paxgRes.json();

                if (!isSubscribed) return;

                setPulse(true);
                setTimeout(() => isSubscribed && setPulse(false), 500);

                const now = Date.now();

                setAssets(prev => prev.map(a => {
                    let newPrice = a.price;
                    let newChange = a.change;

                    if (a.symbol === 'BTC/USD' && btc.lastPrice) {
                        newPrice = parseFloat(btc.lastPrice);
                        newChange = parseFloat(btc.priceChangePercent);
                    } else if (a.symbol === 'ETH/USD' && eth.lastPrice) {
                        newPrice = parseFloat(eth.lastPrice);
                        newChange = parseFloat(eth.priceChangePercent);
                    } else if (a.symbol === 'XAU/USD' && paxg.lastPrice) {
                        // PAXG closely tracks 1oz Gold
                        newPrice = parseFloat(paxg.lastPrice);
                        newChange = parseFloat(paxg.priceChangePercent);
                    } else {
                        // Simulated realistic walk for SPX/DXY since free APIs hard rate-limit 10s polling
                        newPrice = generateWalk(a.price, a.symbol === 'SPX' ? 0.0002 : 0.0001);
                        newChange = a.change + ((newPrice - a.price) / a.price) * 100;
                    }

                    const isUp = newPrice >= a.price;
                    const hasChanged = newPrice !== a.price;

                    return {
                        ...a,
                        price: newPrice,
                        change: newChange,
                        isUp,
                        pulseTime: hasChanged ? now : a.pulseTime
                    };
                }));
            } catch (err) {
                console.error("Market data fetch failed:", err);
            }
        };

        // Initial fetch
        fetchMarketData();

        // Poll strictly every 10 seconds
        const interval = setInterval(fetchMarketData, 10000);

        return () => {
            isSubscribed = false;
            clearInterval(interval);
        };
    }, []);

    return { assets, pulse };
};
