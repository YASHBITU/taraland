// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Clock, ShieldAlert, TrendingUp, TrendingDown } from 'lucide-react';

interface ScanRecord {
    id: string;
    asset: string;
    scan_type: string;
    bias: string;
    entry_zone: number | string;
    stop_loss: number | string;
    take_profit: number | string;
    confidence: string;
    created_at: string;
}

export default function ScanHistory({ refreshTrigger = 0 }: { refreshTrigger?: number }) {
    const [scans, setScans] = useState<ScanRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchScans = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const userId = session?.user?.id || '00000000-0000-0000-0000-000000000000';

                console.log('Fetching scans for user:', userId);

                const { data, error } = await supabase
                    .from('ai_scans')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false })
                    .limit(10);

                if (error) {
                    console.error('Error fetching scans:', error.message);
                    throw error;
                }
                console.log('Fetched scans:', data);
                setScans(data || []);
            } catch (err: any) {
                console.error('Fetch scans error:', err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchScans();

        const subs = supabase
            .channel('ai_scans_changes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ai_scans' }, payload => {
                console.log('New scan received via realtime:', payload.new);
                setScans(prev => [payload.new as ScanRecord, ...prev].slice(0, 10));
            })
            .subscribe();

        return () => {
            subs.unsubscribe();
        };
    }, [refreshTrigger]);

    if (loading) {
        return (
            <div className="bg-[#13161A] border border-[#1C2026] rounded-2xl p-5 shadow-xl flex flex-col items-center justify-center h-full min-h-[300px]">
                <Clock className="w-6 h-6 animate-spin text-[#86909C]" />
            </div>
        );
    }

    return (
        <div className="bg-[#13161A] border border-[#1C2026] rounded-2xl p-5 shadow-xl flex flex-col h-full min-w-0">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C6A84F]" />
                Quantum Scan History
            </h3>

            <div className="flex-1 w-full overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-[#1C2026] text-[10px] text-[#86909C] uppercase tracking-wider">
                            <th className="pb-3 font-medium">Date & Time</th>
                            <th className="pb-3 font-medium">Asset</th>
                            <th className="pb-3 font-medium">Bias</th>
                            <th className="pb-3 font-medium">Entry</th>
                            <th className="pb-3 font-medium">Target</th>
                            <th className="pb-3 font-medium text-right">Confidence</th>
                        </tr>
                    </thead>
                    <tbody className="text-[11px] md:text-xs">
                        {scans.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-[#2B313A]">
                                    <div className="flex flex-col items-center gap-2">
                                        <ShieldAlert className="w-5 h-5" />
                                        <span>No historical records found.</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            scans.map((scan) => (
                                <tr key={scan.id} className="border-b border-[#1C2026]/50 last:border-0 hover:bg-[#1C2026]/30 transition-colors">
                                    <td className="py-3 text-[#86909C] whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-[#5C6B7A]">
                                                {new Date(scan.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                                            </span>
                                            <span className="text-[11px]">
                                                {new Date(scan.created_at).toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 font-mono text-white">{scan.asset}</td>
                                    <td className={`py-3 font-bold flex items-center gap-1 ${scan.bias.includes('LONG') ? 'text-[#00E676]' : scan.bias.includes('SHORT') ? 'text-red-500' : 'text-gray-400'}`}>
                                        {scan.bias.includes('LONG') && <TrendingUp className="w-3 h-3" />}
                                        {scan.bias.includes('SHORT') && <TrendingDown className="w-3 h-3" />}
                                        {scan.bias}
                                    </td>
                                    <td className="py-3 text-white font-mono">{scan.entry_zone}</td>
                                    <td className="py-3 font-mono text-[#00E676]">{scan.take_profit}</td>
                                    <td className="py-3 text-right">
                                        <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider ${scan.confidence === 'HIGH' ? 'bg-[#C6A84F]/10 text-[#C6A84F]' : scan.confidence === 'MEDIUM' ? 'bg-blue-500/10 text-blue-400' : 'bg-[#2B313A] text-gray-400'}`}>
                                            {scan.confidence || 'N/A'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
