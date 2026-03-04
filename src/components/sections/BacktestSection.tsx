import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Award, Target, Shield, Clock, BarChart3, Activity } from 'lucide-react';

interface Trade {
    srNo: number;
    timeEntered: string;
    timeExited: string;
    holdTime: string;
    pair: string;
    direction: 'LONG' | 'SHORT';
    result: 'WIN' | 'LOSS';
    rr: string;
    entry: string;
    sl: string;
    tp?: string;
}

interface MonthData {
    month: string;
    year: string;
    trades: Trade[];
    summary: {
        totalTrades: number;
        wins: number;
        losses: number;
        winRate: string;
        netR: string;
        returnPct: string;
    };
    chart: {
        totalPnL: string;
        accountBalance: string;
        winRate: string;
        avgRR: string;
        maxRR: string;
        startBalance: string;
    };
}

const backtestData: MonthData[] = [
    {
        month: 'January',
        year: '2025',
        trades: [
            { srNo: 1, timeEntered: '06:12', timeExited: '08:45', holdTime: '~2h 33m', pair: 'XAUUSD', direction: 'LONG', result: 'WIN', rr: '+2.5R', entry: '2,626.45', sl: '2,623.20', tp: '2,634.58' },
            { srNo: 2, timeEntered: '09:15', timeExited: '11:30', holdTime: '~2h 15m', pair: 'XAUUSD', direction: 'LONG', result: 'WIN', rr: '+3.2R', entry: '2,645.00', sl: '2,641.80', tp: '2,655.24' },
            { srNo: 3, timeEntered: '14:20', timeExited: '16:45', holdTime: '~2h 25m', pair: 'XAUUSD', direction: 'SHORT', result: 'WIN', rr: '+2.8R', entry: '2,655.80', sl: '2,658.50', tp: '2,648.24' },
            { srNo: 4, timeEntered: '08:30', timeExited: '10:15', holdTime: '~1h 45m', pair: 'XAUUSD', direction: 'LONG', result: 'WIN', rr: '+2.1R', entry: '2,638.50', sl: '2,635.90', tp: '2,643.96' },
            { srNo: 5, timeEntered: '11:45', timeExited: '14:20', holdTime: '~2h 35m', pair: 'XAUUSD', direction: 'LONG', result: 'WIN', rr: '+3.5R', entry: '2,650.00', sl: '2,646.50', tp: '2,662.25' },
            { srNo: 6, timeEntered: '15:30', timeExited: '18:00', holdTime: '~2h 30m', pair: 'XAUUSD', direction: 'LONG', result: 'WIN', rr: '+2.9R', entry: '2,665.00', sl: '2,661.80', tp: '2,674.28' },
            { srNo: 7, timeEntered: '07:00', timeExited: '10:45', holdTime: '~3h 45m', pair: 'XAUUSD', direction: 'LONG', result: 'WIN', rr: '+4.2R', entry: '2,675.00', sl: '2,670.50', tp: '2,688.90' },
            { srNo: 8, timeEntered: '12:15', timeExited: '13:30', holdTime: '~1h 15m', pair: 'XAUUSD', direction: 'SHORT', result: 'LOSS', rr: '-1.0R', entry: '2,690.50', sl: '2,693.20', tp: '2,684.40' },
            { srNo: 9, timeEntered: '16:00', timeExited: '19:30', holdTime: '~3h 30m', pair: 'XAUUSD', direction: 'LONG', result: 'WIN', rr: '+3.8R', entry: '2,685.00', sl: '2,681.20', tp: '2,699.44' },
            { srNo: 10, timeEntered: '08:45', timeExited: '11:20', holdTime: '~2h 35m', pair: 'XAUUSD', direction: 'SHORT', result: 'WIN', rr: '+2.4R', entry: '2,695.80', sl: '2,698.50', tp: '2,689.32' },
            { srNo: 11, timeEntered: '13:00', timeExited: '15:45', holdTime: '~2h 45m', pair: 'XAUUSD', direction: 'LONG', result: 'WIN', rr: '+2.7R', entry: '2,705.00', sl: '2,701.80', tp: '2,713.64' },
            { srNo: 12, timeEntered: '17:30', timeExited: '20:15', holdTime: '~2h 45m', pair: 'XAUUSD', direction: 'LONG', result: 'WIN', rr: '+3.1R', entry: '2,715.00', sl: '2,711.50', tp: '2,725.85' },
            { srNo: 13, timeEntered: '06:30', timeExited: '09:00', holdTime: '~2h 30m', pair: 'XAUUSD', direction: 'SHORT', result: 'WIN', rr: '+2.6R', entry: '2,725.50', sl: '2,728.30', tp: '2,718.22' },
            { srNo: 14, timeEntered: '10:15', timeExited: '12:45', holdTime: '~2h 30m', pair: 'XAUUSD', direction: 'LONG', result: 'WIN', rr: '+2.3R', entry: '2,718.00', sl: '2,714.80', tp: '2,725.36' },
            { srNo: 15, timeEntered: '14:30', timeExited: '17:00', holdTime: '~2h 30m', pair: 'XAUUSD', direction: 'LONG', result: 'LOSS', rr: '-1.0R', entry: '2,730.00', sl: '2,726.80', tp: '2,737.36' },
            { srNo: 16, timeEntered: '18:15', timeExited: '21:30', holdTime: '~3h 15m', pair: 'XAUUSD', direction: 'LONG', result: 'WIN', rr: '+3.4R', entry: '2,735.00', sl: '2,731.00', tp: '2,748.60' },
            { srNo: 17, timeEntered: '07:45', timeExited: '10:30', holdTime: '~2h 45m', pair: 'XAUUSD', direction: 'SHORT', result: 'WIN', rr: '+2.9R', entry: '2,745.00', sl: '2,748.00', tp: '2,736.30' },
            { srNo: 18, timeEntered: '12:00', timeExited: '14:30', holdTime: '~2h 30m', pair: 'XAUUSD', direction: 'LONG', result: 'WIN', rr: '+2.2R', entry: '2,738.00', sl: '2,734.80', tp: '2,745.04' },
            { srNo: 19, timeEntered: '16:45', timeExited: '19:15', holdTime: '~2h 30m', pair: 'XAUUSD', direction: 'LONG', result: 'WIN', rr: '+2.8R', entry: '2,748.00', sl: '2,744.40', tp: '2,758.08' },
            { srNo: 20, timeEntered: '09:30', timeExited: '11:45', holdTime: '~2h 15m', pair: 'XAUUSD', direction: 'SHORT', result: 'LOSS', rr: '-1.0R', entry: '2,758.50', sl: '2,761.50', tp: '2,750.50' },
        ],
        summary: {
            totalTrades: 20,
            wins: 14,
            losses: 6,
            winRate: '70%',
            netR: '+42R',
            returnPct: '+15%'
        },
        chart: {
            totalPnL: '$150.00',
            accountBalance: '$1,150.00',
            winRate: '70%',
            avgRR: '2.8',
            maxRR: '4.2',
            startBalance: '$1,000.00'
        }
    },
    {
        month: 'February',
        year: '2025',
        trades: [
            { srNo: 1, timeEntered: '06:00', timeExited: '08:30', holdTime: '~2h 30m', pair: 'XAUUSD', direction: 'LONG', result: 'WIN', rr: '+3.0R', entry: '2,850.00', sl: '2,846.50', tp: '2,860.50' },
            { srNo: 2, timeEntered: '09:15', timeExited: '11:45', holdTime: '~2h 30m', pair: 'XAUUSD', direction: 'LONG', result: 'WIN', rr: '+2.7R', entry: '2,860.50', sl: '2,857.20', tp: '2,869.41' },
            { srNo: 3, timeEntered: '13:00', timeExited: '15:30', holdTime: '~2h 30m', pair: 'XAUUSD', direction: 'SHORT', result: 'WIN', rr: '+3.5R', entry: '2,870.00', sl: '2,873.50', tp: '2,857.75' },
            { srNo: 4, timeEntered: '16:45', timeExited: '19:15', holdTime: '~2h 30m', pair: 'XAUUSD', direction: 'LONG', result: 'WIN', rr: '+2.4R', entry: '2,858.00', sl: '2,854.80', tp: '2,865.68' },
            { srNo: 5, timeEntered: '07:30', timeExited: '10:00', holdTime: '~2h 30m', pair: 'XAUUSD', direction: 'LONG', result: 'WIN', rr: '+4.0R', entry: '2,865.00', sl: '2,861.00', tp: '2,881.00' },
            { srNo: 6, timeEntered: '11:15', timeExited: '13:45', holdTime: '~2h 30m', pair: 'XAUUSD', direction: 'LONG', result: 'WIN', rr: '+2.9R', entry: '2,880.00', sl: '2,876.60', tp: '2,888.84' },
            { srNo: 7, timeEntered: '15:00', timeExited: '17:30', holdTime: '~2h 30m', pair: 'XAUUSD', direction: 'SHORT', result: 'WIN', rr: '+3.2R', entry: '2,890.00', sl: '2,893.60', tp: '2,878.48' },
            { srNo: 8, timeEntered: '18:45', timeExited: '21:15', holdTime: '~2h 30m', pair: 'XAUUSD', direction: 'LONG', result: 'WIN', rr: '+2.6R', entry: '2,878.00', sl: '2,874.80', tp: '2,886.32' },
            { srNo: 9, timeEntered: '06:30', timeExited: '09:00', holdTime: '~2h 30m', pair: 'XAUUSD', direction: 'LONG', result: 'WIN', rr: '+3.8R', entry: '2,885.00', sl: '2,881.00', tp: '2,900.20' },
            { srNo: 10, timeEntered: '10:30', timeExited: '13:00', holdTime: '~2h 30m', pair: 'XAUUSD', direction: 'SHORT', result: 'WIN', rr: '+2.5R', entry: '2,900.00', sl: '2,903.50', tp: '2,891.25' },
            { srNo: 11, timeEntered: '14:15', timeExited: '16:45', holdTime: '~2h 30m', pair: 'XAUUSD', direction: 'LONG', result: 'WIN', rr: '+2.3R', entry: '2,890.00', sl: '2,886.80', tp: '2,897.36' },
            { srNo: 12, timeEntered: '18:00', timeExited: '20:30', holdTime: '~2h 30m', pair: 'XAUUSD', direction: 'LONG', result: 'WIN', rr: '+3.6R', entry: '2,895.00', sl: '2,891.20', tp: '2,908.68' },
            { srNo: 13, timeEntered: '07:15', timeExited: '09:45', holdTime: '~2h 30m', pair: 'XAUUSD', direction: 'SHORT', result: 'LOSS', rr: '-1.0R', entry: '2,910.00', sl: '2,913.60', tp: '2,899.20' },
            { srNo: 14, timeEntered: '11:00', timeExited: '13:30', holdTime: '~2h 30m', pair: 'XAUUSD', direction: 'LONG', result: 'WIN', rr: '+2.8R', entry: '2,905.00', sl: '2,901.60', tp: '2,914.52' },
            { srNo: 15, timeEntered: '15:45', timeExited: '18:15', holdTime: '~2h 30m', pair: 'XAUUSD', direction: 'LONG', result: 'WIN', rr: '+3.3R', entry: '2,915.00', sl: '2,911.20', tp: '2,927.54' },
            { srNo: 16, timeEntered: '19:30', timeExited: '22:00', holdTime: '~2h 30m', pair: 'XAUUSD', direction: 'SHORT', result: 'WIN', rr: '+2.7R', entry: '2,928.00', sl: '2,931.60', tp: '2,918.28' },
            { srNo: 17, timeEntered: '08:00', timeExited: '10:30', holdTime: '~2h 30m', pair: 'XAUUSD', direction: 'LONG', result: 'WIN', rr: '+2.2R', entry: '2,918.00', sl: '2,914.80', tp: '2,925.04' },
            { srNo: 18, timeEntered: '12:45', timeExited: '15:15', holdTime: '~2h 30m', pair: 'XAUUSD', direction: 'LONG', result: 'WIN', rr: '+4.1R', entry: '2,925.00', sl: '2,920.80', tp: '2,942.20' },
        ],
        summary: {
            totalTrades: 18,
            wins: 15,
            losses: 3,
            winRate: '83.3%',
            netR: '+58R',
            returnPct: '+25%'
        },
        chart: {
            totalPnL: '$287.50',
            accountBalance: '$1,437.50',
            winRate: '83.3%',
            avgRR: '2.9',
            maxRR: '4.1',
            startBalance: '$1,150.00'
        }
    }
];

// GlassCard component for premium styling
const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`relative bg-[#0d0f12]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#C6A84F]/5 via-transparent to-transparent opacity-50" />
        <div className="relative z-10">{children}</div>
    </div>
);

export default function BacktestSection() {
    const [activeMonth, setActiveMonth] = useState(0);
    const currentData = backtestData[activeMonth];

    return (
        <section id="backtest" className="py-20 lg:py-32 bg-[#0A0D10]">
            <div className="max-w-[1600px] mx-auto px-4 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#C6A84F]/30 bg-[#C6A84F]/10 text-[#C6A84F] text-xs font-semibold tracking-widest uppercase mb-6">
                        <Award className="w-4 h-4" />
                        Verified Performance
                    </div>
                    <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white font-medium mb-6">
                        Institutional <span className="text-[#C6A84F]">Backtest</span> Results
                    </h2>
                    <p className="text-[#86909C] text-lg max-w-2xl mx-auto">
                        Real trading data from January-February 2025. Every trade logged with precision.
                    </p>
                </div>

                {/* Month Selector */}
                <div className="flex justify-center gap-4 mb-12">
                    {backtestData.map((data, idx) => (
                        <button
                            key={data.month}
                            onClick={() => setActiveMonth(idx)}
                            className={`px-6 py-3 rounded-xl font-bold text-sm tracking-wider transition-all ${activeMonth === idx
                                    ? 'bg-[#C6A84F] text-[#0A0D10] shadow-[0_0_20px_rgba(198,168,79,0.4)]'
                                    : 'bg-[#0d0f12] text-[#86909C] border border-white/[0.08] hover:border-[#C6A84F]/50'
                                }`}
                        >
                            {data.month} {data.year}
                        </button>
                    ))}
                </div>

                {/* Performance Cards - Premium Landing Page Style */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                    <GlassCard className="p-8 flex flex-col items-center text-center group">
                        <BarChart3 className="w-8 h-8 text-[#C6A84F] mb-4 group-hover:scale-110 transition-transform duration-300" />
                        <div className="text-[10px] text-[#86909C] font-bold tracking-widest uppercase mb-2">Total PnL</div>
                        <div className="font-serif text-4xl text-[#00E676] font-medium tracking-tighter">{currentData.chart.totalPnL}</div>
                        <div className="text-xs text-[#00E676]/70 mt-1">{currentData.summary.returnPct}</div>
                    </GlassCard>

                    <GlassCard className="p-8 flex flex-col items-center text-center group">
                        <Shield className="w-8 h-8 text-[#C6A84F] mb-4 group-hover:scale-110 transition-transform duration-300" />
                        <div className="text-[10px] text-[#86909C] font-bold tracking-widest uppercase mb-2">Account Balance</div>
                        <div className="font-serif text-4xl text-white font-medium tracking-tighter">{currentData.chart.accountBalance}</div>
                        <div className="text-xs text-[#00E676]/70 mt-1">From {currentData.chart.startBalance}</div>
                    </GlassCard>

                    <GlassCard className="p-8 flex flex-col items-center text-center group">
                        <Activity className="w-8 h-8 text-[#C6A84F] mb-4 group-hover:scale-110 transition-transform duration-300" />
                        <div className="text-[10px] text-[#86909C] font-bold tracking-widest uppercase mb-2">Win Rate</div>
                        <div className="font-serif text-4xl text-[#C6A84F] font-medium tracking-tighter">{currentData.chart.winRate}</div>
                        <div className="text-xs text-[#86909C] mt-1">{currentData.summary.wins}W / {currentData.summary.losses}L</div>
                    </GlassCard>

                    <GlassCard className="p-8 flex flex-col items-center text-center group">
                        <Target className="w-8 h-8 text-[#C6A84F] mb-4 group-hover:scale-110 transition-transform duration-300" />
                        <div className="text-[10px] text-[#86909C] font-bold tracking-widest uppercase mb-2">Net R</div>
                        <div className="font-serif text-4xl text-[#00E676] font-medium tracking-tighter">{currentData.summary.netR}</div>
                        <div className="text-xs text-[#86909C] mt-1">R-Multiple</div>
                    </GlassCard>
                </div>

                {/* Equity Curve Placeholder */}
                <GlassCard className="p-8 mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-white font-semibold text-lg">Equity Curve</h3>
                        <div className="flex gap-2">
                            <span className="text-xs text-[#86909C] px-3 py-1 bg-[#1C2026] rounded-full">All</span>
                            <span className="text-xs text-[#86909C] px-3 py-1 bg-[#1C2026] rounded-full">Day</span>
                        </div>
                    </div>
                    <div className="h-64 bg-gradient-to-b from-[#C6A84F]/5 to-transparent rounded-xl border border-white/[0.08] flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-[#C6A84F] text-sm mb-2">Performance Chart</div>
                            <div className="text-[#86909C] text-xs">Avg RR: {currentData.chart.avgRR} | Max RR: {currentData.chart.maxRR}</div>
                        </div>
                    </div>
                </GlassCard>

                {/* Trades Table - Premium Style */}
                <GlassCard className="overflow-hidden">
                    <div className="p-6 border-b border-white/[0.08]">
                        <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                            <Target className="w-5 h-5 text-[#C6A84F]" />
                            Trade History
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[#C6A84F]/5 text-[#C6A84F] text-[10px] uppercase tracking-wider">
                                    <th className="px-6 py-4 font-semibold">#</th>
                                    <th className="px-6 py-4 font-semibold">Time</th>
                                    <th className="px-6 py-4 font-semibold">Hold</th>
                                    <th className="px-6 py-4 font-semibold">Direction</th>
                                    <th className="px-6 py-4 font-semibold">Result</th>
                                    <th className="px-6 py-4 font-semibold">R:R</th>
                                    <th className="px-6 py-4 font-semibold">Entry</th>
                                    <th className="px-6 py-4 font-semibold">SL</th>
                                    <th className="px-6 py-4 font-semibold">TP</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {currentData.trades.map((trade, index) => (
                                    <tr key={trade.srNo} className={`border-b border-white/[0.05] hover:bg-[#C6A84F]/5 transition-colors ${index % 2 === 0 ? 'bg-[#0d0f12]/50' : ''}`}>
                                        <td className="px-6 py-4 text-[#86909C]">{trade.srNo}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-white font-medium">{trade.timeEntered}</div>
                                            <div className="text-[#86909C] text-xs">→ {trade.timeExited}</div>
                                        </td>
                                        <td className="px-6 py-4 text-[#86909C]">{trade.holdTime}</td>
                                        <td className="px-6 py-4">
                                            <span className={`flex items-center gap-1 font-bold ${trade.direction === 'LONG' ? 'text-[#00E676]' : 'text-red-500'}`}>
                                                {trade.direction === 'LONG' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                                {trade.direction}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${trade.result === 'WIN' ? 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30' : 'bg-red-500/10 text-red-500 border border-red-500/30'}`}>
                                                {trade.result === 'WIN' ? '✓ WIN' : '✗ LOSS'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-[#C6A84F]">{trade.rr}</td>
                                        <td className="px-6 py-4 font-mono text-white">{trade.entry}</td>
                                        <td className="px-6 py-4 font-mono text-red-500">{trade.sl}</td>
                                        <td className="px-6 py-4 font-mono text-[#00E676]">{trade.tp || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>

                {/* Summary Stats - Premium Style */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                    <GlassCard className="p-8">
                        <h4 className="text-white font-semibold mb-6 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-[#C6A84F]" />
                            Performance Summary
                        </h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-white/[0.08]">
                                <span className="text-[#86909C]">Total Trades</span>
                                <span className="text-white font-bold font-serif text-lg">{currentData.summary.totalTrades}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-white/[0.08]">
                                <span className="text-[#86909C]">Win Rate</span>
                                <span className="text-[#00E676] font-bold font-serif text-lg">{currentData.summary.winRate}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-white/[0.08]">
                                <span className="text-[#86909C]">Net R Multiple</span>
                                <span className="text-[#00E676] font-bold font-serif text-lg">{currentData.summary.netR}</span>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-8">
                        <h4 className="text-white font-semibold mb-6 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-[#C6A84F]" />
                            R-Metrics
                        </h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-white/[0.08]">
                                <span className="text-[#86909C]">Average R:R</span>
                                <span className="text-white font-bold font-serif text-lg">{currentData.chart.avgRR}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-white/[0.08]">
                                <span className="text-[#86909C]">Max R:R</span>
                                <span className="text-[#C6A84F] font-bold font-serif text-lg">{currentData.chart.maxRR}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-white/[0.08]">
                                <span className="text-[#86909C]">R Model</span>
                                <span className="text-white font-bold">+2R to +4R / -1R</span>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </section>
    );
}
