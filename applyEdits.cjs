const fs = require('fs');

let c = fs.readFileSync('d:/tarapto/src/components/terminal/Engine.tsx', 'utf8');

// 1. imports
if (!c.includes("import { supabase }")) {
    c = c.replace(/import { AreaChart[\s\S]*?;/, `$&
import { supabase } from '../../lib/supabase';
import ScanHistory from './ScanHistory';`);
}

// 2. models
c = c.replace(/const ANALYST_MODELS = \[[\s\S]*?\];/, `const ANALYST_MODELS = [
    "Qwen/Qwen3-8B",
    "THUDM/glm-4-9b-chat",
    "THUDM/GLM-4-9B-0414"
];`);

c = c.replace(/const JUDGE_MODEL = "deepseek-ai\/DeepSeek-R1-0528-Qwen3-8B";/, `const JUDGE_MODEL = "Qwen/Qwen2.5-7B-Instruct";`);

// 3. internal state
if (!c.includes("setScanRefreshKey")) {
    c = c.replace(/const \[judgeVerdict, setJudgeVerdict\] = useState<any>\(null\);/, `$&
    const [scanRefreshKey, setScanRefreshKey] = useState(0);`);
}

// 4. logToDatabase function
if (!c.includes("const logToDatabase = async")) {
    c = c.replace(/const runScan = async \(\) => \{/, `const logToDatabase = async (verdict: any, rawJson: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;
            await supabase.from('ai_scans').insert({
                user_id: session.user.id,
                asset: 'BTCUSDT',
                scan_type: 'AUTO_ENGINE',
                bias: verdict.bias,
                entry_zone: verdict.entry,
                stop_loss: verdict.sl,
                take_profit: verdict.tp,
                confidence: verdict.status === 'INVALIDATED' || verdict.status === 'VETO' ? 'INVALIDATED' : verdict.confidence,
                full_json_verdict: JSON.parse(rawJson || '{}')
            });
        } catch (err) {
            console.error(err);
        }
    };

    const runScan = async () => {`);
}

// 5. call logToDatabase inside runScan
c = c.replace(/setHistory\(prev => \[\{\n\s*time: new Date\(\)\.toLocaleTimeString\(\),[\s\S]*?\}\, \.\.\.prev\]\.slice\(0, 6\)\);/, `await logToDatabase({
                ...verdict,
                confidence: verdict.status === 'INVALIDATED' || verdict.status === 'VETO' ? 'INVALIDATED' : verdict.confidence
            }, cleanJson);
            setTimeout(() => setScanRefreshKey(prev => prev + 1), 1000);`);

// 6. remove "Next Scan: 10:00" and buttons
c = c.replace(/<button className="hover:text-white transition-colors">Council Reports<\/button>\r?\n?\s*<button className="hover:text-white transition-colors">Risk Desk<\/button>/g, '');
c = c.replace(/<div className="bg-\[#1C2026\] px-4 py-1\.5 rounded-full flex items-center gap-2 border border-\[#2B313A\]">\r?\n?\s*<div className="w-2 h-2 rounded-full bg-\[#00E676\] animate-pulse"><\/div>\r?\n?\s*<span className="text-xs font-mono text-\[#E5E7EB\]">Next Scan: \{Math\.floor\(countdown \/ 60\)\}:\{\(countdown \% 60\)\.toString\(\)\.padStart\(2, '0'\)\}<\/span>\r?\n?\s*<\/div>/g, '');

// 7. replace inline history with ScanHistory component
c = c.replace(/\{\/\* SIGNAL HISTORY \*\/\}[\s\S]*?(?=<\/div>\r?\n?\s*<\/div>\r?\n?\s*<\/div>\r?\n?\s*<\/div>\r?\n?\s*<style>)/, `<ScanHistory refreshTrigger={scanRefreshKey} />\r\n                            `);


fs.writeFileSync('d:/tarapto/src/components/terminal/Engine.tsx', c, 'utf8');
