// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import { Activity, X, ChevronRight, Settings, User } from 'lucide-react';

const TARA_SYSTEM_PROMPT = `
You are TARA, an institutional-grade analytical trading engine.
Your mission is strictly objective, probabilistic evaluation based on visual market data.

### 1. BIAS IMMUNITY & EXHAUSTION PROTOCOL
- You must remain completely NEUTRAL. Do not favor LONG signals.
- SHORT signals are expected and required when market structure is bearish or EXHAUSTED.
- CRITICAL: If a trend is clearly overextended (too far from moving averages or key origins), you MUST look for "Mean Reversion" or "Distribution" SHORTS.
- Do not blindly follow the trend if it looks like it's "climaxing" or "sweeping buy-side liquidity" only to reverse.

### 2. THE "ANTI-CHOP" VOLATILITY FILTER (CRITICAL)
- **Identify Compression:** If candles are small, overlapping, and range-bound (typical of Asian Session or Pre-NFP), output "STAY AWAY".
- **Avoid The Bleed:** Do not signal an entry inside a tight consolidation. Wait for a clear Break of Structure (BOS) with Displacement (large candle body).
- **Low Probability:** If the 5m and 15m/1H are conflicting or flat, the signal is "STAY AWAY".

### 3. IMAGE HANDLING PROTOCOL
Interpret images in this sequence:
1. **Scenario A (Multiple Files):** Slot 1 (1H Macro Trend) -> Slot 2 (15M Structure) -> Slot 3 (5M Intraday) -> Slot 4 (1M Entry).
2. **Scenario B (Single File/Composite):** If a SINGLE image is provided that contains MULTIPLE charts (e.g., a TradingView split-screen layout), you MUST identify the separate timeframes within that single image. Analyze the macro structure from one part, order flow from another, and entry from the third.
3. Treat a single composite screenshot as valid input for all required timeframes.

### 4. PRICE & VALUE PROTOCOL
- "confidence": MUST be an integer between 0 and 100. **Penalize confidence below 80 for ranges.**
- "entryZone" & "targetZone": MUST be a SINGLE optimal price value.
- "riskToReward": Calculate a realistic ratio (e.g., 1:3). **Minimum 1:2 required.**

### REQUIRED OUTPUT FORMAT (JSON)
Respond ONLY with this JSON structure. Do not include markdown code blocks like \`\`\`json. Just the raw JSON string.
{
  "pattern": "string",
  "bias": "string",
  "entryZone": "string",
  "stopLoss": "string",
  "targetZone": "string",
  "expectedDirection": "LONG" | "SHORT" | "STAY AWAY",
  "breakoutPrice": "string",
  "confidence": 0,
  "riskToReward": "string",
  "thesis": "string",
  "invalidation": "string",
  "reasoning": {
    "regime": "string",
    "multiTF": "string",
    "volumeMicro": "string",
    "liquidity": "string",
    "volatility": "string",
    "divergingTF": "string"
  },
  "catalysts": "string",
  "riskNotes": "string",
  "newsWatchlist": "string",
  "extractedTicker": "string"
}
`;

interface Message {
    id: string;
    role: 'user' | 'ai' | 'system';
    content: string;
    images?: string[];
    parsedData?: any;
}

export default function Engine({ onClose }: { onClose: () => void }) {
    const [images, setImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
    const [tickerDisplay, setTickerDisplay] = useState("MARKET SCANNER");

    const chatEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleResize = () => {
            setIsSidebarOpen(window.innerWidth > 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image/') !== -1) {
                    const blob = items[i].getAsFile();
                    if (blob) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            if (event.target?.result && images.length < 4) {
                                const base64 = (event.target.result as string).split(',')[1];
                                setImages(prev => [...prev, base64].slice(0, 4));
                            }
                        };
                        reader.readAsDataURL(blob);
                    }
                }
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [images]);

    const startNewChat = () => {
        setMessages([]);
        setImages([]);
        setInput('');
        setTickerDisplay("MARKET SCANNER");
    };

    const removeImage = (idx: number) => {
        setImages(prev => prev.filter((_, i) => i !== idx));
    };

    const handleEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const sendMessage = async () => {
        const textStr = input.trim();
        const hasImages = images.length > 0;

        if ((!textStr && !hasImages) || isLoading) return;

        const currentImages = [...images];
        const newMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: textStr,
            images: currentImages
        };

        setMessages(prev => [...prev, newMsg]);
        setInput('');
        setImages([]);
        setIsLoading(true);

        try {
            const API_KEY = import.meta.env.VITE_SILICONFLOW_API_KEY || 'YOUR_API_KEY';

            const userContent: any[] = [];
            if (textStr) {
                userContent.push({ type: 'text', text: textStr });
            } else {
                userContent.push({ type: 'text', text: "Analyze these charts according to the Multi-Timeframe Protocol (1H, 15m, 5m, 1m). If single image, treat as composite layout." });
            }

            currentImages.forEach((imgBase64) => {
                userContent.push({
                    type: 'image_url',
                    image_url: {
                        url: `data:image/png;base64,${imgBase64}`
                    }
                });
            });

            const apiMessages = [
                { role: 'system', content: TARA_SYSTEM_PROMPT },
                { role: 'user', content: userContent }
            ];

            const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: 'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B',
                    messages: apiMessages
                })
            });

            if (!response.ok) {
                // Try fallback model if deepseek format fails
                console.warn(`Primary model failed (${response.status}), trying fallback GLM-4.7`);
                const fallbackResponse = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${API_KEY}`
                    },
                    body: JSON.stringify({
                        model: 'Pro/zai-org/GLM-4.7',
                        messages: apiMessages
                    })
                });

                if (!fallbackResponse.ok) {
                    throw new Error(`API Error: ${fallbackResponse.status}`);
                }
                const fallbackData = await fallbackResponse.json();
                processResponse(fallbackData);
                return;
            }

            const data = await response.json();
            processResponse(data);

        } catch (error: any) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'system',
                content: `ERROR: ${error.message}`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const processResponse = (data: any) => {
        let aiText = data.choices?.[0]?.message?.content || data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!aiText) throw new Error("No content generated");

        // Sometimes deepseek-r1 returns <think> blocks, we should strip them or just parse JSON directly
        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        let parsedData = null;
        if (jsonMatch) {
            try {
                parsedData = JSON.parse(jsonMatch[0]);
                if (parsedData.extractedTicker) {
                    setTickerDisplay(parsedData.extractedTicker);
                }
                aiText = jsonMatch[0]; // strictly set to JSON
            } catch (e) { }
        }

        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'ai',
            content: aiText,
            parsedData
        }]);
    }

    const renderTARACard = (data: any) => {
        const isLong = data.expectedDirection === 'LONG';
        const isShort = data.expectedDirection === 'SHORT';

        let btnClass = 'bg-gray-700 text-gray-400 cursor-not-allowed';
        let btnText = 'WAIT / STAY AWAY';
        let btnShadow = '';
        let statusText = 'STAY AWAY';
        let statusColor = 'text-gray-500';

        if (isLong) {
            btnClass = 'bg-emerald-500 hover:bg-emerald-400 text-white';
            btnText = 'BUY NOW';
            btnShadow = 'shadow-[0_0_20px_rgba(16,185,129,0.4)]';
            statusText = 'BULLISH';
            statusColor = 'text-emerald-500';
        } else if (isShort) {
            btnClass = 'bg-red-500 hover:bg-red-400 text-white';
            btnText = 'SELL NOW';
            btnShadow = 'shadow-[0_0_20px_rgba(239,68,68,0.4)]';
            statusText = 'BEARISH';
            statusColor = 'text-red-500';
        }

        return (
            <div className="w-full">
                <div className="bg-[#1c1c1c] border border-[#333] rounded-2xl rounded-tl-none p-5 shadow-lg mb-4 animate-fade-in">
                    <p className="text-sm text-gray-300 leading-relaxed">
                        Analysis complete. <strong className={statusColor}>{statusText} {data.pattern?.toUpperCase() || 'SETUP'}</strong> detected.
                    </p>
                </div>

                <div className="signal-card rounded-2xl p-6 relative overflow-hidden animate-fade-in border border-[#333] bg-gradient-to-br from-[#1a1a1a] to-[#111111]">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-gold-primary text-gold-light" />
                            <span className="text-xs font-bold text-gold-light tracking-[0.2em] uppercase">{data.extractedTicker || 'ASSET'} PREMIUM SIGNAL</span>
                        </div>
                        <div className="bg-[#333] text-[#ccc] text-[10px] font-bold px-2 py-1 rounded border border-[#444]">
                            {data.confidence}% CONFIDENCE
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div>
                            <p className="text-[10px] text-[#666] uppercase font-bold tracking-wider mb-1">ENTRY PRICE</p>
                            <p className="text-2xl font-bold text-white font-mono">{data.entryZone}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-[#666] uppercase font-bold tracking-wider mb-1">TAKE PROFIT</p>
                            <p className="text-2xl font-bold text-gold-light font-mono">{data.targetZone}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-[#666] uppercase font-bold tracking-wider mb-1">STOP LOSS</p>
                            <p className="text-2xl font-bold text-[#ef4444] font-mono">{data.stopLoss}</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between border-t border-[#333] pt-6 gap-4">
                        <div className="flex gap-8 w-full md:w-auto">
                            <div>
                                <p className="text-[10px] text-[#666] uppercase font-bold mb-0.5">RISK/REWARD</p>
                                <p className="text-sm font-medium text-white">{data.riskToReward}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-[#666] uppercase font-bold mb-0.5">ESTIMATED MOVE</p>
                                <p className="text-sm font-medium text-white">{data.reasoning?.volatility || "Standard"}</p>
                            </div>
                        </div>
                        <button className={`w-full md:w-auto ${btnClass} font-bold text-xs px-6 py-3 rounded-lg flex items-center justify-center gap-2 ${btnShadow} transition-all transform hover:scale-105`}>
                            <ChevronRight className="w-3 h-3 rotate-90" />
                            {btnText}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[200] flex bg-[#0a0a0a] text-white font-sans overflow-hidden">
            {/* LEFT SIDEBAR */}
            <aside className={`flex flex-col border-r border-[#222] bg-[#0e0e0e] z-30 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden opacity-0'}`}>
                <div className="p-6 flex items-center gap-3 border-b border-[#222] min-w-[16rem]">
                    <div className="w-8 h-8 rounded-lg bg-gold-light flex items-center justify-center text-black font-bold text-xl shadow-[0_0_15px_rgba(252,213,53,0.4)] flex-shrink-0">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="font-bold text-white text-sm tracking-wide">TARA<span className="font-light text-gold-light">PRO</span></h1>
                        <span className="text-[10px] text-[#666] block">Institutional Engine</span>
                    </div>
                </div>

                <div className="px-4 mt-6 min-w-[16rem]">
                    <button onClick={startNewChat} className="w-full flex items-center justify-center gap-2 bg-[#1c1c1c] hover:bg-[#222] border border-[#333] text-white py-3 rounded-lg text-xs font-bold transition-all active:scale-95 group whitespace-nowrap">
                        <ChevronRight className="w-4 h-4 text-gold-light group-hover:rotate-90 transition-transform flex-shrink-0" />
                        NEW ANALYSIS
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-6 overflow-hidden min-w-[16rem]">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-gold-light bg-gold-light/10 border-l-[3px] border-gold-light rounded-lg text-left whitespace-nowrap">
                        <Activity className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-medium">Terminal</span>
                    </button>
                    <button onClick={onClose} className="w-full flex items-center gap-3 px-4 py-3 text-[#888] hover:text-white rounded-lg transition-colors text-left whitespace-nowrap group">
                        <X className="w-5 h-5 flex-shrink-0 group-hover:text-red-400 transition-colors" />
                        <span className="text-sm font-medium">Exit Engine</span>
                    </button>
                </nav>

                <div className="p-6 border-t border-[#222] whitespace-nowrap overflow-hidden min-w-[16rem]">
                    <p className="text-xs font-bold text-[#666] uppercase mb-4 tracking-wider">Session History</p>
                    <div className="space-y-4">
                        <p className="text-[10px] text-[#444] italic">Active memory synced.</p>
                    </div>
                </div>

                <div className="p-4 bg-[#0a0a0a] border-t border-[#222] flex items-center gap-3 whitespace-nowrap overflow-hidden min-w-[16rem]">
                    <div className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-[#888]" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-white">Professional Trader</p>
                        <p className="text-[10px] text-gold-light uppercase tracking-wider">Premium Plan</p>
                    </div>
                </div>
            </aside>

            {/* CENTER MAIN */}
            <main className="flex-1 flex flex-col relative w-full min-w-0" ref={containerRef}>
                <header className="h-16 border-b border-[#222] flex items-center justify-between px-6 bg-[#0e0e0e]">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-[#888] hover:text-white focus:outline-none p-1 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        </button>
                        <div className="h-6 w-px bg-[#333]"></div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-xs font-medium text-[#888] tracking-widest uppercase hidden md:inline">Live Engine</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-white tracking-wide">{tickerDisplay}</span>
                        <span className="text-xs text-emerald-500 font-mono">ACTIVE</span>
                    </div>
                </header>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
                    {messages.length === 0 && (
                        <div className="flex gap-4 max-w-2xl animate-fade-in">
                            <div className="w-8 h-8 rounded-full bg-gold-light flex-shrink-0 flex items-center justify-center">
                                <Activity className="w-4 h-4 text-black" />
                            </div>
                            <div className="bg-[#1c1c1c] border border-[#333] rounded-2xl rounded-tl-none p-5 shadow-lg">
                                <p className="text-sm text-gray-300 leading-relaxed mb-4">
                                    System Ready. Anti-Chop Protocol Active.
                                </p>
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    Upload charts (Macro, Structure, Entry) to begin probabilistic evaluation. <br />
                                    <span className="text-gold-light">Recommendation:</span> Use 1H + 15m for Trend, 5m for Structure, 1m for Entry. Paste anywhere (Ctrl+V).
                                </p>
                            </div>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-4 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                            {msg.role === 'system' ? (
                                <div className="w-full text-center text-red-500 font-mono text-xs p-2 border border-red-900 bg-red-900/10 rounded animate-pulse">{msg.content}</div>
                            ) : msg.role === 'user' ? (
                                <>
                                    <div className="w-8 h-8 rounded-full bg-[#222] flex-shrink-0 flex items-center justify-center border border-[#333]">
                                        <User className="w-4 h-4 text-[#888]" />
                                    </div>
                                    <div className="flex flex-col items-end">
                                        {msg.images && msg.images.length > 0 && (
                                            <div className="bg-[#1a1a1a] border border-[#333] border-gold-light/50 rounded-2xl p-4 mb-2">
                                                <p className="text-gold-light text-xs font-bold mb-3">Analysis Request: {msg.images.length} {msg.images.length > 1 ? 'Timeframes' : 'Composite View'}</p>
                                                <div className="flex gap-2">
                                                    {msg.images.map((src, i) => (
                                                        <img key={i} src={`data:image/png;base64,${src}`} className="w-20 h-12 object-cover rounded border border-[#444]" />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {msg.content && (
                                            <div className="bg-[#222] text-white px-5 py-3 rounded-2xl rounded-tr-none text-sm">{msg.content}</div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-8 h-8 rounded-full bg-gold-light flex-shrink-0 flex items-center justify-center">
                                        <Activity className="w-4 h-4 text-black" />
                                    </div>
                                    {msg.parsedData ? renderTARACard(msg.parsedData) : (
                                        <div className="bg-[#1c1c1c] border border-[#333] rounded-2xl rounded-tl-none p-5 shadow-lg prose prose-invert prose-sm max-w-none w-full"
                                            dangerouslySetInnerHTML={{ __html: marked(msg.content) }} />
                                    )}
                                </>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex items-center gap-3 p-4 animate-pulse ml-12">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gold-light rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                <div className="w-2 h-2 bg-gold-light rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gold-light rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span className="text-xs font-mono text-[#666] tracking-widest">ANALYZING MARKET DATA...</span>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 md:p-6 pt-0 bg-transparent z-10 relative mt-auto">
                    <div className="bg-[#1c1c1c] border border-[#333] rounded-2xl p-2 flex items-center shadow-2xl max-w-4xl mx-auto relative">
                        {/* Upload Slots */}
                        <div className="flex gap-1.5 mr-2 ml-1">
                            {['1H', '15M', '5M', '1M'].map((label, idx) => {
                                const isFilled = !!images[idx];
                                return (
                                    <div key={idx} onClick={() => isFilled && removeImage(idx)} className={`w-10 h-9 rounded bg-[#111] flex items-center justify-center relative cursor-pointer group border transition-colors ${isFilled ? 'border-gold-light bg-gold-light/5' : 'border-[#333] hover:border-[#555]'}`}>
                                        <span className="text-[9px] text-[#666] font-bold group-hover:text-white font-mono">{label}</span>
                                        {isFilled && (
                                            <>
                                                <img src={`data:image/png;base64,${images[idx]}`} className="absolute inset-0 w-full h-full object-cover rounded opacity-60 group-hover:opacity-100 transition-opacity" />
                                                <div className="absolute inset-0 bg-gold-light/10"></div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="h-6 w-px bg-[#333] mx-2 hidden sm:block"></div>

                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleEnter}
                            rows={1}
                            placeholder={images.length > 0 ? `${images.length}/4 uploaded. Paste next or Enter...` : "Paste charts (Ctrl+V) or ask TARA..."}
                            className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-white flex-1 px-2 md:px-4 py-3 resize-none placeholder-[#444] font-mono leading-tight"
                        />

                        <div className="flex items-center gap-3 pr-1">
                            <span className="text-[10px] text-[#555] font-mono hidden md:block whitespace-nowrap">Ctrl+V to paste</span>
                            <button onClick={sendMessage} disabled={isLoading} className="bg-gold-light hover:brightness-110 text-black rounded-lg p-2.5 transition-transform active:scale-95 shadow-[0_0_15px_rgba(198,168,79,0.3)] flex items-center justify-center">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

