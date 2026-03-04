import fs from 'fs';

// Read Engine.tsx
let engine = fs.readFileSync('d:/tarapto/src/components/terminal/Engine.tsx', 'utf8');

// 1. Remove deepseek model
engine = engine.replace(/[\s]*\{ id: 'deepseek-ai\/DeepSeek-R1-0528-Qwen3-8B', provider: 'siliconflow', prompt: 'Mean Reversion expert.' \},/, '');

// 2. Remove Council Reports & Risk Desk buttons
engine = engine.replace(/<button className="hover:text-white transition-colors">Council Reports<\/button>/g, '');
engine = engine.replace(/<button className="hover:text-white transition-colors">Risk Desk<\/button>/g, '');

// 3. Remove Next Scan Timer
engine = engine.replace(/<div className="bg-\[#1C2026\] px-4 py-1.5 rounded-full flex items-center gap-2 border border-\[#2B313A\] hidden md:flex">[\s\S]*?<\/div>/, '');

fs.writeFileSync('d:/tarapto/src/components/terminal/Engine.tsx', engine, 'utf8');

// Read VisionEngine.tsx
let vision = fs.readFileSync('d:/tarapto/src/components/terminal/VisionEngine.tsx', 'utf8');
vision = vision.replace(/'deepseek-ai\/DeepSeek-R1-0528-Qwen3-8B'/g, "'Qwen/Qwen2.5-7B-Instruct'");
fs.writeFileSync('d:/tarapto/src/components/terminal/VisionEngine.tsx', vision, 'utf8');

console.log("Modifications complete.");
