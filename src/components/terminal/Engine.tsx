// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Activity, X, ChevronRight, TrendingUp, TrendingDown, Clock, ShieldAlert, Cpu } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import ScanHistory from './ScanHistory';


// Models - Working models only
const ANALYST_MODELS = [
    "deepseek-ai/DeepSeek-R1-0528-Qwen3-8B",
    "THUDM/GLM-4-9B-0414",
    "THUDM/GLM-4.1V-9B-Thinking"
];
const JUDGE_MODEL = "THUDM/GLM-Z1-9B-0414";



export default function Engine({ onClose }: { onClose: () => void }) {
    const [selectedAsset, setSelectedAsset] = useState<'BTC' | 'XAU'>('BTC');
    const [selectedTimeframe, setSelectedTimeframe] = useState<'15M' | '1H' | '4H' | '1D'>('15M');
    const [price, setPrice] = useState<number>(0);
    const [priceChange, setPriceChange] = useState<number>(0);
    const [chartData, setChartData] = useState<any[]>([]);

    const [isScanning, setIsScanning] = useState(false);
    const [countdown, setCountdown] = useState(600); // 10 mins

    const [reports, setReports] = useState<Record<string, { status: string, raw: string }>>({});
    const [judgeVerdict, setJudgeVerdict] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [scanTrigger, setScanTrigger] = useState(0);

    // Asset configuration
    const assetConfig = {
        BTC: { symbol: 'BTCUSDT', wsSymbol: 'btcusdt', display: 'BTC / USDT', icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=024' },
        XAU: { symbol: 'PAXGUSDT', wsSymbol: 'paxgusdt', display: 'XAU / USD', icon: 'https://cryptologos.cc/logos/paxos-standard-pax-logo.svg?v=024' }
    };

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
        const wsSymbol = assetConfig[selectedAsset].wsSymbol;
        const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${wsSymbol}@ticker`);
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setPrice(parseFloat(data.c));
            setPriceChange(parseFloat(data.P));
        };
        return () => ws.close();
    }, [selectedAsset]);

    // Fetch chart data when asset or timeframe changes
    useEffect(() => {
        const fetchKlines = async () => {
            try {
                const symbol = assetConfig[selectedAsset].symbol;
                const intervalMap: Record<string, string> = {
                    '15M': '15m',
                    '1H': '1h',
                    '4H': '4h',
                    '1D': '1d'
                };
                const binanceInterval = intervalMap[selectedTimeframe];
                const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${binanceInterval}&limit=50`);
                const data = await res.json();
                const formatted = data.map((d: any) => ({
                    time: selectedTimeframe === '1D'
                        ? new Date(d[0]).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                        : new Date(d[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    price: parseFloat(d[4])
                }));
                setChartData(formatted);
            } catch (e) {
                console.error(e);
            }
        };
        fetchKlines();
        const intervalMinutes = selectedTimeframe === '15M' ? 15 : selectedTimeframe === '1H' ? 60 : selectedTimeframe === '4H' ? 240 : 1440;
        const interval = setInterval(fetchKlines, intervalMinutes * 60 * 1000);
        return () => clearInterval(interval);
    }, [selectedAsset, selectedTimeframe]);

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

        if (!API_KEY || API_KEY === 'YOUR_API_KEY' || API_KEY === 'placeholder') {
            throw new Error('API Key not configured. Please add VITE_SILICONFLOW_API_KEY to your .env file.');
        }

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

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`SiliconFlow API Error ${res.status}:`, errorText);
            if (res.status === 403) {
                throw new Error('API Key invalid or expired. Please check your VITE_SILICONFLOW_API_KEY in .env file.');
            }
            throw new Error(`Model Error: ${res.status} - ${errorText}`);
        }

        const data = await res.json();
        return data.choices[0]?.message?.content || "";
    };

    const getMarketIntel = async () => {
        const symbol = assetConfig[selectedAsset].symbol;
        const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=5`);
        const data = await res.json();
        return data.map((d: any) => `C:${d[4]} H:${d[2]} L:${d[3]}`).join(' | ');
    };

    const runScan = async () => {
        if (isScanning) return;
        setIsScanning(true);
        setJudgeVerdict(null);

        try {
            const intel = await getMarketIntel();
            const assetName = assetConfig[selectedAsset].display;
            const userPrompt = `${assetName} @ $${price}\nMarket Context (1H): ${intel}\nOutput ONLY: Bias (LONG/SHORT), Entry price, Stop Loss, Take Profit. Be purely objective.`;

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

            const judgePrompt = `Current ${assetConfig[selectedAsset].display} Price: ${price}\n\nAnalyst Reports:\n${allIntel}\n\nReturn consolidated JSON ONLY.`;

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
            const status = parseFloat(rr) >= 1.5 ? "EXECUTE" : "INVALIDATED";

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

            // Save scan to local history
            setHistory(prev => [{
                time: new Date().toLocaleTimeString(),
                bias: verdict.bias,
                entry: verdict.entry,
                sl: verdict.sl,
                tp: verdict.tp,
                status: verdict.status
            }, ...prev].slice(0, 6));

            // Save scan to Supabase
            await saveScanToSupabase(verdict);

            // Trigger ScanHistory refresh
            setScanTrigger(prev => prev + 1);

        } catch (error) {
            console.error(error);
        } finally {
            setIsScanning(false);
            setCountdown(600);
        }
    };

    const saveScanToSupabase = async (scanData: any) => {
        try {
            const { supabase } = await import('../../lib/supabase');
            const { data: { session } } = await supabase.auth.getSession();

            // Use authenticated user ID or anonymous ID
            const userId = session?.user?.id || '00000000-0000-0000-0000-000000000000';

            console.log('Attempting to save scan to Supabase...', scanData);

            const { data, error } = await supabase
                .from('ai_scans')
                .insert({
                    user_id: userId,
                    asset: assetConfig[selectedAsset].display,
                    scan_type: 'AUTO_ENGINE',
                    bias: scanData.bias || 'NEUTRAL',
                    entry_zone: scanData.entry?.toString() || '0',
                    stop_loss: scanData.sl?.toString() || '0',
                    take_profit: scanData.tp?.toString() || '0',
                    confidence: typeof scanData.confidence === 'number' ? scanData.confidence : 50,
                    risk_to_reward: scanData.rr || 'N/A',
                    created_at: new Date().toISOString()
                })
                .select();

            if (error) {
                console.error('Error saving scan to Supabase:', error.message, error.details);
                alert('Failed to save scan: ' + error.message);
            } else {
                console.log('Scan saved to Supabase successfully:', data);
            }
        } catch (err: any) {
            console.error('Failed to save scan to Supabase:', err);
            alert('Exception saving scan: ' + err.message);
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

                    </div>
                </div>

                <div className="flex items-center gap-4">

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
                            <div className="mb-6">
                                <h2 className="text-white font-semibold mb-4">Judge Verdict</h2>

                                {/* Asset Selection */}
                                <div className="flex gap-2 mb-4">
                                    <button
                                        onClick={() => setSelectedAsset('BTC')}
                                        className={`flex-1 text-xs py-2 rounded-lg transition-all font-bold ${selectedAsset === 'BTC'
                                            ? 'bg-[#1C2026] border border-[#C6A84F] text-[#C6A84F]'
                                            : 'bg-[#0A0D10] border border-[#2B313A] text-[#86909C] hover:border-[#C6A84F]/50 hover:text-[#C6A84F]'
                                            }`}
                                    >
                                        BTC/USDT
                                    </button>
                                    <button
                                        onClick={() => setSelectedAsset('XAU')}
                                        className={`flex-1 text-xs py-2 rounded-lg transition-all font-bold ${selectedAsset === 'XAU'
                                            ? 'bg-[#1C2026] border border-[#C6A84F] text-[#C6A84F]'
                                            : 'bg-[#0A0D10] border border-[#2B313A] text-[#86909C] hover:border-[#C6A84F]/50 hover:text-[#C6A84F]'
                                            }`}
                                    >
                                        XAU/USD
                                    </button>
                                </div>

                                {/* Attractive Gold Scan Button */}
                                <button
                                    onClick={runScan}
                                    disabled={isScanning}
                                    className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 ${isScanning
                                        ? 'bg-[#1C2026] text-[#86909C] cursor-not-allowed'
                                        : 'bg-gradient-to-r from-[#C6A84F] via-[#D4B76A] to-[#C6A84F] text-[#0A0D10] shadow-[0_0_30px_rgba(198,168,79,0.4)] hover:shadow-[0_0_40px_rgba(198,168,79,0.6)]'
                                        }`}
                                >
                                    {isScanning ? (
                                        <>
                                            <Cpu className="w-5 h-5 animate-spin" />
                                            ANALYZING MARKET...
                                        </>
                                    ) : (
                                        <>
                                            <Activity className="w-5 h-5" />
                                            INITIATE QUANTUM SCAN
                                        </>
                                    )}
                                </button>

                                {/* Next Scan Timer */}
                                <div className="flex items-center justify-center gap-2 mt-3 text-[10px] text-[#86909C]">
                                    <Clock className="w-3 h-3" />
                                    Auto-scan in {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                                </div>
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
                                        <img src={assetConfig[selectedAsset].icon} className="w-full h-full" alt={selectedAsset} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                            {assetConfig[selectedAsset].display}
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
                                        <button
                                            key={tf}
                                            onClick={() => setSelectedTimeframe(tf as '15M' | '1H' | '4H' | '1D')}
                                            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${tf === selectedTimeframe ? 'bg-[#1C2026] text-white' : 'text-[#86909C] hover:text-white'}`}
                                        >
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

                            {/* SCAN HISTORY FROM SUPABASE */}
                            <ScanHistory refreshTrigger={scanTrigger} />
                        </div>

                    </div>
                </div>
            </div>

            <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #2B313A; border-radius: 4px; }`}</style>
        </div>
    );
}
