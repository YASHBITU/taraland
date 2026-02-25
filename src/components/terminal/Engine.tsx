// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Activity, X, ChevronRight, TrendingUp, TrendingDown, DollarSign, Clock, ShieldAlert, Cpu } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Models
const ANALYST_MODELS = [
    "Qwen/Qwen3-8B",
    "THUDM/glm-4-9b-chat",
    "THUDM/GLM-4-9B-0414",
    "THUDM/GLM-Z1-9B-0414"
];
const JUDGE_MODEL = "deepseek-ai/DeepSeek-R1-0528-Qwen3-8B";

interface Signal {
    time: string;
    bias: string;
    entry: number;
    sl: number;
    tp: number;
    status: string;
}

export default function Engine({ onClose }: { onClose: () => void }) {
    const [price, setPrice] = useState<number>(0);
    const [priceChange, setPriceChange] = useState<number>(0);
    const [chartData, setChartData] = useState<any[]>([]);

    const [isScanning, setIsScanning] = useState(false);
    const [countdown, setCountdown] = useState(600); // 10 mins

    const [reports, setReports] = useState<Record<string, { status: string, raw: string }>>({});
    const [judgeVerdict, setJudgeVerdict] = useState<any>(null);
    const [history, setHistory] = useState<Signal[]>([]);

    // Initialize reports state
    useEffect(() => {
        const initReports: any = {};
        ANALYST_MODELS.forEach(m => {
            initReports[m] = { status: "WAITING", raw: "-" };
        });
        setReports(initReports);
    }, []);

    // WebSocket for Live Price
    useEffect(() => {
        const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setPrice(parseFloat(data.c));
            setPriceChange(parseFloat(data.P));
        };
        return () => ws.close();
    }, []);

    // Fetch initial chart data
    useEffect(() => {
        const fetchKlines = async () => {
            try {
                const res = await fetch('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=15m&limit=50');
                const data = await res.json();
                const formatted = data.map((d: any) => ({
                    time: new Date(d[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    price: parseFloat(d[4])
                }));
                setChartData(formatted);
            } catch (e) {
                console.error(e);
            }
        };
        fetchKlines();
        const interval = setInterval(fetchKlines, 15 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // Timer countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1 && !isScanning) {
                    runScan();
                    return 600;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [isScanning]);

    const callSiliconFlow = async (model: string, systemPrompt: string, userPrompt: string) => {
        const API_KEY = import.meta.env.VITE_SILICONFLOW_API_KEY;
        const res = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                max_tokens: 500
            })
        });
        if (!res.ok) throw new Error(`Model Error: ${res.status}`);
        const data = await res.json();
        return data.choices[0]?.message?.content || "";
    };

    const getMarketIntel = async () => {
        const res = await fetch('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=5');
        const data = await res.json();
        return data.map((d: any) => `C:${d[4]} H:${d[2]} L:${d[3]}`).join(' | ');
    };

    const runScan = async () => {
        if (isScanning) return;
        setIsScanning(true);
        setJudgeVerdict(null);

        try {
            const intel = await getMarketIntel();
            const userPrompt = `BTC @ $${price}\nMarket Context (1H): ${intel}\nOutput ONLY: Bias (LONG/SHORT), Entry price, Stop Loss, Take Profit. Be purely objective.`;

            // Run Analysts
            const newReports = { ...reports };
            await Promise.all(ANALYST_MODELS.map(async (model) => {
                newReports[model] = { status: "POLLING...", raw: "" };
                setReports({ ...newReports });
                try {
                    const out = await callSiliconFlow(model, "You are an elite crypto quantitative analyst. Be extremely concise.", userPrompt);
                    newReports[model] = { status: "OK", raw: out.substring(0, 150) };
                } catch (e) {
                    newReports[model] = { status: "FAILED", raw: "API timeout or error." };
                }
                setReports({ ...newReports });
            }));

            // Run Judge
            const judgeSystem = "You are a trading signal consolidator. Analyze analyst reports. JSON Output ONLY. Exact keys: 'bias' (LONG/SHORT), 'entry' (number), 'sl' (number), 'tp' (number), 'confidence' (string). No markdown blocks.";

            let allIntel = "";
            for (const m of ANALYST_MODELS) {
                allIntel += `[${m}]: ${newReports[m].raw}\n`;
            }

            const judgePrompt = `Current BTC Price: ${price}\n\nAnalyst Reports:\n${allIntel}\n\nReturn consolidated JSON ONLY.`;

            const rawJudge = await callSiliconFlow(JUDGE_MODEL, judgeSystem, judgePrompt);

            // Clean markdown json fences
            let cleanJson = rawJudge.replace(/```json/g, '').replace(/```/g, '').trim();

            // Just matching first { to last }
            const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
            if (jsonMatch) cleanJson = jsonMatch[0];

            let jData: any = {};
            try {
                jData = JSON.parse(cleanJson);
            } catch (e) {
                jData = { bias: "ERROR", entry: price, sl: price * 0.99, tp: price * 1.02, confidence: "LOW" };
            }

            const risk = Math.abs(parseFloat(jData.entry) - parseFloat(jData.sl)) || 1;
            const reward = Math.abs(parseFloat(jData.tp) - parseFloat(jData.entry));
            const rr = (reward / risk).toFixed(2);
            const status = parseFloat(rr) >= 1.5 ? "EXECUTE" : "VETO";

            const verdict = {
                bias: jData.bias?.toUpperCase() || "STAY AWAY",
                entry: parseFloat(jData.entry) || price,
                sl: parseFloat(jData.sl) || 0,
                tp: parseFloat(jData.tp) || 0,
                rr: rr,
                status: status,
                confidence: jData.confidence || "MEDIUM" // Fix case
            };

            setJudgeVerdict(verdict);

            setHistory(prev => [{
                time: new Date().toLocaleTimeString(),
                bias: verdict.bias,
                entry: verdict.entry,
                sl: verdict.sl,
                tp: verdict.tp,
                status: verdict.status
            }, ...prev].slice(0, 6));

        } catch (error) {
            console.error(error);
        } finally {
            setIsScanning(false);
            setCountdown(600);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-[#0A0D10] text-[#86909C] font-sans flex flex-col overflow-hidden">
            {/* Header Area */}
            <header className="h-16 border-b border-[#1C2026] flex items-center justify-between px-6 bg-[#0E1216] shrink-0">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Activity className="w-6 h-6 text-[#00E676]" />
                        <span className="font-bold text-white text-lg tracking-wide">TARA<span className="font-light text-[#00E676]">PRO</span></span>
                    </div>

                    <div className="hidden md:flex gap-6 text-sm font-medium">
                        <button className="text-white border-b-2 border-[#00E676] pb-5 pt-5">Dashboard</button>
                        <button className="hover:text-white transition-colors">Council Reports</button>
                        <button className="hover:text-white transition-colors">Risk Desk</button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-[#1C2026] px-4 py-1.5 rounded-full flex items-center gap-2 border border-[#2B313A]">
                        <div className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></div>
                        <span className="text-xs font-mono text-[#E5E7EB]">Next Scan: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[#1C2026] rounded-lg transition-colors">
                        <X className="w-5 h-5 text-[#86909C]" />
                    </button>
                </div>
            </header>

            {/* Main Content Dashboard */}
            <div className="flex-1 overflow-y-auto w-full p-4 md:p-6 lg:p-8 custom-scrollbar">
                <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* LEFT COLUMN: SWAP / VERDICT WIDGET */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-[#13161A] border border-[#1C2026] rounded-2xl p-5 shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-white font-semibold">Judge Verdict</h2>
                                <button onClick={runScan} disabled={isScanning} className="bg-[#1C2026] hover:bg-[#2B313A] border border-[#2B313A] text-white text-xs px-3 py-1.5 rounded-md transition-all flex items-center gap-1">
                                    {isScanning ? <Cpu className="w-3 h-3 animate-spin" /> : <Activity className="w-3 h-3" />}
                                    {isScanning ? 'Scanning' : 'Scan Now'}
                                </button>
                            </div>

                            {judgeVerdict ? (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="bg-[#0A0D10] border border-[#1C2026] rounded-xl p-4">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-medium uppercase tracking-wider text-[#86909C]">Direction</span>
                                            <span className={`text-sm font-bold ${judgeVerdict.bias.includes('LONG') ? 'text-[#00E676]' : judgeVerdict.bias.includes('SHORT') ? 'text-red-500' : 'text-gray-400'}`}>
                                                {judgeVerdict.bias}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-[#0A0D10] border border-[#1C2026] rounded-xl p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-medium uppercase tracking-wider text-[#86909C]">Entry</span>
                                            <span className="text-sm font-mono text-white">${judgeVerdict.entry.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-medium uppercase tracking-wider text-[#86909C]">Target</span>
                                            <span className="text-sm font-mono text-[#00E676]">${judgeVerdict.tp.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-medium uppercase tracking-wider text-[#86909C]">Stop Loss</span>
                                            <span className="text-sm font-mono text-red-500">${judgeVerdict.sl.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-[#0A0D10] border border-[#1C2026] rounded-xl p-3 text-center">
                                            <p className="text-[10px] uppercase mb-1">Risk/Reward</p>
                                            <p className="font-bold text-white font-mono">1 : {judgeVerdict.rr}</p>
                                        </div>
                                        <div className="flex-1 bg-[#0A0D10] border border-[#1C2026] rounded-xl p-3 text-center">
                                            <p className="text-[10px] uppercase mb-1">Status</p>
                                            <p className={`font-bold ${judgeVerdict.status === 'EXECUTE' ? 'text-[#00E676]' : 'text-red-500'}`}>{judgeVerdict.status}</p>
                                        </div>
                                    </div>

                                    <button className={`w-full py-3.5 rounded-xl font-bold text-white tracking-wide transition-all transform hover:scale-[1.02] active:scale-95 ${judgeVerdict.status === 'EXECUTE' ? 'bg-[#00E676] hover:bg-[#00C853] text-[#0A0D10]' : 'bg-[#2B313A] text-gray-400 cursor-not-allowed'}`}>
                                        {judgeVerdict.status === 'EXECUTE' ? 'EXECUTE SIGNAL' : 'SIGNAL VETOED'}
                                    </button>
                                </div>
                            ) : (
                                <div className="h-64 flex flex-col items-center justify-center border border-dashed border-[#2B313A] rounded-xl bg-[#0A0D10]/50">
                                    <ShieldAlert className="w-8 h-8 text-[#2B313A] mb-3" />
                                    <p className="text-xs text-[#86909C]">Awaiting Next Council Scan...</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* MIDDLE & RIGHT COLUMN */}
                    <div className="lg:col-span-9 flex flex-col gap-6 w-full">

                        {/* CHART WIDGET */}
                        <div className="bg-[#13161A] border border-[#1C2026] rounded-2xl p-5 shadow-xl w-full">
                            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-[#1C2026] rounded-full flex items-center justify-center p-2">
                                        <img src="https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=024" className="w-full h-full" alt="BTC" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                            BTC / USDT
                                            <span className="text-xs bg-[#1C2026] px-2 py-0.5 rounded text-[#86909C]">Perp</span>
                                        </h2>
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-xl font-bold text-white">${price > 0 ? price.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '...'}</span>
                                            <span className={`text-sm font-medium flex items-center ${priceChange >= 0 ? 'text-[#00E676]' : 'text-red-500'}`}>
                                                {priceChange >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                                                {priceChange > 0 ? '+' : ''}{priceChange.toFixed(2)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex bg-[#0A0D10] rounded-lg p-1 border border-[#1C2026]">
                                    {['15M', '1H', '4H', '1D'].map(tf => (
                                        <button key={tf} className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${tf === '15M' ? 'bg-[#1C2026] text-white' : 'text-[#86909C] hover:text-white'}`}>
                                            {tf}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#00E676" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#00E676" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="time" hide />
                                        <YAxis domain={['auto', 'auto']} hide />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#13161A', borderColor: '#2B313A', borderRadius: '8px', color: '#fff' }}
                                            itemStyle={{ color: '#00E676' }}
                                        />
                                        <Area type="monotone" dataKey="price" stroke="#00E676" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" isAnimationActive={false} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* ANALYSTS & HISTORY GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">

                            {/* ANALYST REPORTS */}
                            <div className="bg-[#13161A] border border-[#1C2026] rounded-2xl p-5 shadow-xl flex flex-col h-full min-w-0">
                                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                    <Cpu className="w-4 h-4 text-[#00E676]" />
                                    Analyst Council Data
                                </h3>
                                <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                    {Object.entries(reports).map(([model, data]: [string, any], idx) => (
                                        <div key={idx} className="bg-[#0A0D10] border border-[#1C2026] rounded-xl p-3">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-bold text-white truncate max-w-[150px] block">{model.split('/').pop()}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${data.status === 'OK' ? 'bg-[#00E676]/10 text-[#00E676]' : data.status === 'WAITING' ? 'bg-[#2B313A] text-gray-400' : 'bg-red-500/10 text-red-500'}`}>
                                                    {data.status}
                                                </span>
                                            </div>
                                            <p className="text-xs leading-relaxed text-[#86909C] line-clamp-2">
                                                {data.raw || "Awaiting scan trigger..."}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* SIGNAL HISTORY */}
                            <div className="bg-[#13161A] border border-[#1C2026] rounded-2xl p-5 shadow-xl flex flex-col h-full min-w-0">
                                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-[#00E676]" />
                                    Trade Signal History
                                </h3>

                                <div className="flex-1 w-full overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-[#1C2026] text-xs text-[#86909C] uppercase tracking-wider">
                                                <th className="pb-3 font-medium">Time</th>
                                                <th className="pb-3 font-medium">Bias</th>
                                                <th className="pb-3 font-medium">Entry</th>
                                                <th className="pb-3 font-medium text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {history.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="py-8 text-center text-xs text-[#2B313A]">No signals in current session</td>
                                                </tr>
                                            ) : (
                                                history.map((sig, idx) => (
                                                    <tr key={idx} className="border-b border-[#1C2026]/50 last:border-0 hover:bg-[#1C2026]/30 transition-colors">
                                                        <td className="py-3 text-[#86909C]">{sig.time}</td>
                                                        <td className={`py-3 font-semibold ${sig.bias.includes('LONG') ? 'text-[#00E676]' : sig.bias.includes('SHORT') ? 'text-red-500' : 'text-gray-400'}`}>
                                                            {sig.bias}
                                                        </td>
                                                        <td className="py-3 text-white font-mono">${sig.entry.toLocaleString()}</td>
                                                        <td className="py-3 text-right">
                                                            <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${sig.status === 'EXECUTE' ? 'bg-[#00E676]/10 text-[#00E676]' : 'bg-[#2B313A] text-gray-400'}`}>
                                                                {sig.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #2B313A; border-radius: 4px; }`}</style>
        </div>
    );
}
