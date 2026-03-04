import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Calendar, Clock, Target, Shield, Award } from 'lucide-react';

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
    };
    chart: {
        totalPnL: string;
        accountBalance: string;
        winRate: string;
        avgRR: string;
        maxRR: string;
    };
}

const backtestData: MonthData[] = [
    {
        month: 'January',
        year: '2025',
        trades: [
            { srNo: 1, timeEntered: '06:12', timeExited: '06:48', holdTime: '~36m', pair: 'XAUUSD', direction: 'LONG', result: 'WIN', rr: '+2.06R', entry: '2,626.45', sl: '2,623.79', tp: '2,631.92' },
            { srNo: 2, timeEntered: '05:59', timeExited: '06:40', holdTime: '~41m', pair: 'XAUUSD', direction: 'LONG', result: 'LOSS', rr: '-1.0R', entry: '2,660.00', sl: '2,658.18' },
            { srNo: 3, timeEntered: '05:58', timeExited: '06:31', holdTime: '~33m', pair: 'XAUUSD', direction: 'SHORT', result: 'LOSS', rr: '-1.0R', entry: '2,633.13', sl: '2,635.49' },
            { srNo: 4, timeEntered: '06:22', timeExited: '07:12', holdTime: '~50m', pair: 'XAUUSD', direction: 'LONG', result: 'LOSS', rr: '-1.0R', entry: '2,661.06', sl: '2,657.32' },
            { srNo: 5, timeEntered: '06:05', timeExited: '12:15', holdTime: '~6h 10m', pair: 'XAUUSD', direction: 'LONG', result: 'WIN', rr: '+2.02R', entry: '2,671.00', sl: '2,667.80', tp: '2,677.47' },
            { srNo: 6, timeEntered: '06:00', timeExited: '10:12', holdTime: '~4h 12m', pair: 'XAUUSD', direction: 'LONG', result: 'WIN', rr: '+2.0R', entry: '2,668.020', sl: '2,664.978', tp: '2,674.855' },
            { srNo: 7, timeEntered: '11:45', timeExited: '18:52', holdTime: '~21h 07m', pair: 'XAUUSD', direction: 'LONG', result: 'WIN', rr: '+2.0R', entry: '2,677.405', sl: '2,667.805', tp: '2,696.530' },
            { srNo: 8, timeEntered: '07:12', timeExited: '07:21', holdTime: '~9m', pair: 'XAUUSD', direction: 'SHORT', result: 'LOSS', rr: '-1.0R', entry: '2,700.493', sl: '2,707.123' },
            { srNo: 9, timeEntered: '06:00', timeExited: '06:32', holdTime: '~32m', pair: 'XAUUSD', direction: 'SHORT', result: 'LOSS', rr: '-1.0R', entry: '2,717.526', sl: '2,713.520' },
            { srNo: 10, timeEntered: '06:28', timeExited: '08:12', holdTime: '~1h 44m', pair: 'XAUUSD', direction: 'SHORT', result: 'LOSS', rr: '-1.0R', entry: '2,697.165', sl: '2,698.056' },
        ],
        summary: {
            totalTrades: 18,
            wins: 7,
            losses: 11,
            winRate: '38.88%',
            netR: '+3R'
        },
        chart: {
            totalPnL: '$40.37',
            accountBalance: '$1,040.37',
            winRate: '47.37%',
            avgRR: '2.01',
            maxRR: '2.06'
        }
    },
    {
        month: 'February',
        year: '2025',
        trades: [
            { srNo: 20, timeEntered: '06:00', timeExited: '06:40', holdTime: '~40m', pair: 'XAUUSD', direction: 'SHORT', result: 'LOSS', rr: '-1R', entry: '2793.506', sl: '2796.985' },
            { srNo: 21, timeEntered: '06:00', timeExited: '09:45', holdTime: '~3h 45m', pair: 'XAUUSD', direction: 'LONG', result: 'WIN', rr: '+2.0R', entry: '2844.493', sl: '2838.975', tp: '2857.715' },
            { srNo: 22, timeEntered: '06:00', timeExited: '06:42', holdTime: '~42m', pair: 'XAUUSD', direction: 'LONG', result: 'LOSS', rr: '-1R', entry: '2867.521', sl: '2864.058' },
            { srNo: 23, timeEntered: '05:55', timeExited: '08:30', holdTime: '~2h 35m', pair: 'XAUUSD', direction: 'LONG', result: 'WIN', rr: '+2R', entry: '2860.037', sl: '2855.072', tp: '2870.023' },
            { srNo: 24, timeEntered: '05:57', timeExited: '06:37', holdTime: '~40m', pair: 'XAUUSD', direction: 'LONG', result: 'WIN', rr: '+2R', entry: '2867.521', sl: '2864.058', tp: '2876.045' },
            { srNo: 25, timeEntered: '06:00', timeExited: '06:22', holdTime: '~22m', pair: 'XAUUSD', direction: 'SHORT', result: 'LOSS', rr: '-1R', entry: '2918.020', sl: '2924.575' },
            { srNo: 26, timeEntered: '05:55', timeExited: '06:35', holdTime: '~40m', pair: 'XAUUSD', direction: 'SHORT', result: 'LOSS', rr: '-1R', entry: '2897.749', sl: '2901.007' },
            { srNo: 27, timeEntered: '05:55', timeExited: '06:37', holdTime: '~42m', pair: 'XAUUSD', direction: 'LONG', result: 'WIN', rr: '+2R', entry: '2906.509', sl: '2903.526', tp: '2912.505' },
            { srNo: 28, timeEntered: '06:00', timeExited: '06:22', holdTime: '~22m', pair: 'XAUUSD', direction: 'LONG', result: 'WIN', rr: '+2R', entry: '2928.493', sl: '2927.011', tp: '2932.120' },
            { srNo: 29, timeEntered: '06:00', timeExited: '06:37', holdTime: '~37m', pair: 'XAUUSD', direction: 'SHORT', result: 'LOSS', rr: '-1R', entry: '2899.749', sl: '2901.007' },
        ],
        summary: {
            totalTrades: 17,
            wins: 10,
            losses: 7,
            winRate: '60%',
            netR: '+9R'
        },
        chart: {
            totalPnL: '$80.04',
            accountBalance: '$1,080.04',
            winRate: '64.71%',
            avgRR: '2',
            maxRR: '2'
        }
    }
];

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
                                    : 'bg-[#1C2026] text-[#86909C] border border-[#2B313A] hover:border-[#C6A84F]/50'
                                }`}
                        >
                            {data.month} {data.year}
                        </button>
                    ))}
                </div>

                {/* Performance Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <div className="bg-[#13161A] border border-[#1C2026] rounded-2xl p-6">
                        <div className="text-[#86909C] text-xs uppercase tracking-wider mb-2">Total PnL</div>
                        <div className="text-2xl font-bold text-[#00E676]">{currentData.chart.totalPnL}</div>
                        <div className="text-xs text-[#00E676]/70">+{parseFloat(currentData.chart.totalPnL.replace('$', '')) / 10}%</div>
                    </div>
                    <div className="bg-[#13161A] border border-[#1C2026] rounded-2xl p-6">
                        <div className="text-[#86909C] text-xs uppercase tracking-wider mb-2">Account Balance</div>
                        <div className="text-2xl font-bold text-white">{currentData.chart.accountBalance}</div>
                        <div className="text-xs text-[#00E676]/70">+{parseFloat(currentData.chart.accountBalance.replace('$', '').replace(',', '')) / 100 - 10}%</div>
                    </div>
                    <div className="bg-[#13161A] border border-[#1C2026] rounded-2xl p-6">
                        <div className="text-[#86909C] text-xs uppercase tracking-wider mb-2">Win Rate</div>
                        <div className="text-2xl font-bold text-[#C6A84F]">{currentData.chart.winRate}</div>
                        <div className="text-xs text-[#86909C]">{currentData.summary.wins}W / {currentData.summary.losses}L</div>
                    </div>
                    <div className="bg-[#13161A] border border-[#1C2026] rounded-2xl p-6">
                        <div className="text-[#86909C] text-xs uppercase tracking-wider mb-2">Net R</div>
                        <div className="text-2xl font-bold text-[#00E676]">{currentData.summary.netR}</div>
                        <div className="text-xs text-[#86909C]">R-Multiple</div>
                    </div>
                </div>

                {/* Equity Curve Placeholder */}
                <div className="bg-[#13161A] border border-[#1C2026] rounded-2xl p-8 mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-white font-semibold text-lg">Equity Curve</h3>
                        <div className="flex gap-2">
                            <span className="text-xs text-[#86909C] px-3 py-1 bg-[#1C2026] rounded-full">All</span>
                            <span className="text-xs text-[#86909C] px-3 py-1 bg-[#1C2026] rounded-full">Day</span>
                        </div>
                    </div>
                    <div className="h-64 bg-gradient-to-b from-[#C6A84F]/5 to-transparent rounded-xl border border-[#1C2026] flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-[#C6A84F] text-sm mb-2">Performance Chart</div>
                            <div className="text-[#86909C] text-xs">Avg RR: {currentData.chart.avgRR} | Max RR: {currentData.chart.maxRR}</div>
                        </div>
                    </div>
                </div>

                {/* Trades Table */}
                <div className="bg-[#13161A] border border-[#1C2026] rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-[#1C2026]">
                        <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                            <Target className="w-5 h-5 text-[#C6A84F]" />
                            Trade History
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[#1C2026]/50 text-[#86909C] text-xs uppercase tracking-wider">
                                    <th className="px-6 py-4">#</th>
                                    <th className="px-6 py-4">Time</th>
                                    <th className="px-6 py-4">Hold</th>
                                    <th className="px-6 py-4">Direction</th>
                                    <th className="px-6 py-4">Result</th>
                                    <th className="px-6 py-4">R:R</th>
                                    <th className="px-6 py-4">Entry</th>
                                    <th className="px-6 py-4">SL</th>
                                    <th className="px-6 py-4">TP</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {currentData.trades.map((trade) => (
                                    <tr key={trade.srNo} className="border-b border-[#1C2026]/50 hover:bg-[#1C2026]/30 transition-colors">
                                        <td className="px-6 py-4 text-[#86909C]">{trade.srNo}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-white">{trade.timeEntered}</div>
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
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${trade.result === 'WIN' ? 'bg-[#00E676]/10 text-[#00E676]' : 'bg-red-500/10 text-red-500'}`}>
                                                {trade.result === 'WIN' ? '✅ WIN' : '❌ LOSS'}
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
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                    <div className="bg-[#13161A] border border-[#1C2026] rounded-2xl p-8">
                        <h4 className="text-white font-semibold mb-6 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-[#C6A84F]" />
                            Performance Summary
                        </h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-[#1C2026]">
                                <span className="text-[#86909C]">Total Trades</span>
                                <span className="text-white font-bold">{currentData.summary.totalTrades}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-[#1C2026]">
                                <span className="text-[#86909C]">Win Rate</span>
                                <span className="text-[#00E676] font-bold">{currentData.summary.winRate}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-[#1C2026]">
                                <span className="text-[#86909C]">Net R Multiple</span>
                                <span className="text-[#00E676] font-bold">{currentData.summary.netR}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#13161A] border border-[#1C2026] rounded-2xl p-8">
                        <h4 className="text-white font-semibold mb-6 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-[#C6A84F]" />
                            R-Metrics
                        </h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-[#1C2026]">
                                <span className="text-[#86909C]">Average R:R</span>
                                <span className="text-white font-bold">{currentData.chart.avgRR}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-[#1C2026]">
                                <span className="text-[#86909C]">Max R:R</span>
                                <span className="text-[#C6A84F] font-bold">{currentData.chart.maxRR}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-[#1C2026]">
                                <span className="text-[#86909C]">R Model</span>
                                <span className="text-white font-bold">+2R / -1R</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
