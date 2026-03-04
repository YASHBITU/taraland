import fs from 'fs';
let c = fs.readFileSync('d:/tarapto/src/components/terminal/Engine.tsx', 'utf8');

c = c.replace(/if \(verdict\.status === 'EXECUTE'\) \{\r?\n?\s*await logToDatabase\(verdict, cleanJson\);\r?\n?\s*\}/,
    `await logToDatabase({
                ...verdict,
                confidence: verdict.status === 'INVALIDATED' ? 'INVALIDATED' : verdict.confidence
            }, cleanJson);`);

fs.writeFileSync('d:/tarapto/src/components/terminal/Engine.tsx', c, 'utf8');
