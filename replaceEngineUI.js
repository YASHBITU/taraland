import fs from 'fs';

let c = fs.readFileSync('d:/tarapto/src/components/terminal/Engine.tsx', 'utf8');

const targetHeader = `<header className="h-16 border-b border-[#1C2026] flex items-center justify-between px-6 bg-[#0E1216] shrink-0">`;
const newHeader = `<header className="h-auto md:h-16 border-b border-[#1C2026] flex flex-col md:flex-row items-center justify-between px-4 md:px-6 py-4 md:py-0 bg-[#0E1216] shrink-0 gap-4 md:gap-0 w-full">`;

const targetControls = `<div className="flex items-center gap-4">
                    <div className="flex bg-[#1C2026] p-1 rounded-full border border-[#2B313A]">
                        <button onClick={() => setAsset('XAU/USD')} className={\`px-4 py-1.5 rounded-full text-xs font-bold transition-all \${asset === 'XAU/USD' ? 'bg-[#C6A84F] text-[#0A0D10]' : 'text-[#86909C] hover:text-white'}\`}>XAU/USD</button>
                        <button onClick={() => setAsset('BTC/USD')} className={\`px-4 py-1.5 rounded-full text-xs font-bold transition-all \${asset === 'BTC/USD' ? 'bg-[#00E676] text-[#0A0D10]' : 'text-[#86909C] hover:text-white'}\`}>BTC/USD</button>
                    </div>
                    <div className="bg-[#1C2026] px-4 py-1.5 rounded-full flex items-center gap-2 border border-[#2B313A]">
                        <div className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></div>
                        <span className="text-xs font-mono text-[#E5E7EB]">Next Scan: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[#1C2026] rounded-lg transition-colors">
                        <X className="w-5 h-5 text-[#86909C]" />
                    </button>
                </div>`;

const newControls = `<div className="flex flex-wrap items-center justify-center md:justify-end gap-3 md:gap-4 w-full md:w-auto">
                    <div className="flex bg-[#1C2026] p-1 rounded-full border border-[#2B313A]">
                        <button onClick={() => setAsset('XAU/USD')} className={\`px-4 py-1.5 rounded-full text-xs font-bold transition-all \${asset === 'XAU/USD' ? 'bg-[#C6A84F] text-[#0A0D10]' : 'text-[#86909C] hover:text-white'}\`}>XAU/USD</button>
                        <button onClick={() => setAsset('BTC/USD')} className={\`px-4 py-1.5 rounded-full text-xs font-bold transition-all \${asset === 'BTC/USD' ? 'bg-[#00E676] text-[#0A0D10]' : 'text-[#86909C] hover:text-white'}\`}>BTC/USD</button>
                    </div>
                    <div className="bg-[#1C2026] px-4 py-1.5 rounded-full flex items-center gap-2 border border-[#2B313A] hidden md:flex">
                        <div className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></div>
                        <span className="text-xs font-mono text-[#E5E7EB]">Next Scan: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[#1C2026] rounded-lg transition-colors absolute top-4 right-4 md:relative md:top-auto md:right-auto">
                        <X className="w-5 h-5 text-[#86909C]" />
                    </button>
                </div>`;

const targetButton = `<div className="flex justify-between items-center mb-6">
                                <h2 className="text-white font-semibold">Judge Verdict</h2>
                                <button onClick={runScan} disabled={isScanning} className="bg-[#1C2026] hover:bg-[#2B313A] border border-[#2B313A] text-white text-xs px-3 py-1.5 rounded-md transition-all flex items-center gap-1">
                                    {isScanning ? <Cpu className="w-3 h-3 animate-spin" /> : <Activity className="w-3 h-3" />}
                                    {isScanning ? 'Scanning' : 'Scan Now'}
                                </button>
                            </div>`;

const newButton = `<div className="flex flex-col mb-6 space-y-4 text-center items-center pb-4 border-b border-[#1C2026]">
                                <h2 className="text-white font-semibold text-lg uppercase tracking-widest text-[#C6A84F]">Judge Verdict</h2>
                                <button onClick={runScan} disabled={isScanning} className="shimmer-sweep bg-gradient-to-r from-[#C6A84F] to-[#8C7335] hover:brightness-110 border border-[#C6A84F]/50 shadow-[0_0_20px_rgba(198,168,79,0.3)] text-[#0A0D10] font-bold text-sm px-8 py-3 rounded-full transition-all flex items-center justify-center gap-2 w-full max-w-[280px]">
                                    {isScanning ? <Cpu className="w-5 h-5 animate-spin text-[#0A0D10]" /> : <Activity className="w-5 h-5 text-[#0A0D10]" />}
                                    {isScanning ? 'INITIALIZING...' : 'INITIATE SCAN'}
                                </button>
                            </div>`;

c = c.replace(targetHeader.trim(), newHeader.trim());

// Windows normalizer
const normalize = (str) => str.replace(/\r\n/g, '\n').replace(/\s+/g, ' ');

const startSearch = normalize(c);

c = c.split('\n').join('\r\n'); // normalize to what might be in the file
// Safer: just use regex with [\s\S]*?

c = c.replace(/className="h-16 border-b border-\[#1C2026\] flex items-center justify-between px-6 bg-\[#0E1216\] shrink-0"/g, 'className="h-auto md:h-16 border-b border-[#1C2026] flex flex-col md:flex-row items-center justify-between px-4 md:px-6 py-4 md:py-0 bg-[#0E1216] shrink-0 gap-4 md:gap-0 w-full"');

c = c.replace(/<div className="flex items-center gap-4">[\s\S]*?<button onClick=\{onClose\} className="p-2/g, `<div className="flex flex-wrap items-center justify-center md:justify-end gap-3 md:gap-4 w-full md:w-auto">
                    <div className="flex bg-[#1C2026] p-1 rounded-full border border-[#2B313A]">
                        <button onClick={() => setAsset('XAU/USD')} className={\`px-4 py-1.5 rounded-full text-xs font-bold transition-all \${asset === 'XAU/USD' ? 'bg-[#C6A84F] text-[#0A0D10]' : 'text-[#86909C] hover:text-white'}\`}>XAU/USD</button>
                        <button onClick={() => setAsset('BTC/USD')} className={\`px-4 py-1.5 rounded-full text-xs font-bold transition-all \${asset === 'BTC/USD' ? 'bg-[#00E676] text-[#0A0D10]' : 'text-[#86909C] hover:text-white'}\`}>BTC/USD</button>
                    </div>
                    <div className="bg-[#1C2026] px-4 py-1.5 rounded-full flex items-center gap-2 border border-[#2B313A] hidden md:flex">
                        <div className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></div>
                        <span className="text-xs font-mono text-[#E5E7EB]">Next Scan: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</span>
                    </div>
                    <button onClick={onClose} className="p-2 absolute top-4 right-4 md:relative md:top-auto md:right-auto`);

c = c.replace(/<div className="flex justify-between items-center mb-6">[\s\S]*?Scan Now'\}[\s\S]*?<\/button>[\s\S]*?<\/div>/, newButton);


fs.writeFileSync('d:/tarapto/src/components/terminal/Engine.tsx', c, 'utf8');
