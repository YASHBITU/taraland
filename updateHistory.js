import fs from 'fs';

// ScanHistory.tsx
let h = fs.readFileSync('d:/tarapto/src/components/terminal/ScanHistory.tsx', 'utf8');
h = h.replace(/export default function ScanHistory\(\) \{/, 'export default function ScanHistory({ refreshTrigger = 0 }: { refreshTrigger?: number }) {');
h = h.replace(/    \}, \[\]\);/g, '    }, [refreshTrigger]);');
fs.writeFileSync('d:/tarapto/src/components/terminal/ScanHistory.tsx', h, 'utf8');

// Engine.tsx
let e = fs.readFileSync('d:/tarapto/src/components/terminal/Engine.tsx', 'utf8');
if (!e.includes('const [scanRefreshKey,')) {
    e = e.replace(/const \[judgeVerdict, setJudgeVerdict\] = useState\(null\);/, 'const [judgeVerdict, setJudgeVerdict] = useState(null);\n    const [scanRefreshKey, setScanRefreshKey] = useState(0);');
    e = e.replace(/await logToDatabase\(\{[\s\S]*?\}, cleanJson\);/g, `await logToDatabase({
                ...verdict,
                confidence: verdict.status === 'INVALIDATED' ? 'INVALIDATED' : verdict.confidence
            }, cleanJson);
            setTimeout(() => setScanRefreshKey(prev => prev + 1), 1000);`);
    e = e.replace(/<ScanHistory \/>/, '<ScanHistory refreshTrigger={scanRefreshKey} />');
    fs.writeFileSync('d:/tarapto/src/components/terminal/Engine.tsx', e, 'utf8');
}
console.log("Done.");
