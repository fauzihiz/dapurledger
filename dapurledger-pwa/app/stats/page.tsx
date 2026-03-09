'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import Header from '@/components/Header';
import { Wallet, ArrowDownRight, ArrowUpRight, History, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Link from 'next/link';

export default function StatsPage() {
    const cashflow = useLiveQuery(() => db.cashflow.orderBy('date').reverse().toArray());

    const totalIn = cashflow?.filter(c => c.type === 'in').reduce((acc, curr) => acc + curr.amount, 0) || 0;
    const totalOut = cashflow?.filter(c => c.type === 'out').reduce((acc, curr) => acc + curr.amount, 0) || 0;
    const balance = totalIn - totalOut;

    return (
        <div className="animate-slide-up">
            <Header
                title="Kas"
                action={
                    <Link href="/expenses/new" className="flex items-center gap-1 bg-rose-500 text-white pl-2.5 pr-3.5 py-1.5 rounded-full text-[13px] font-semibold active:scale-95 transition-transform">
                        <Plus className="w-4 h-4" /> Biaya
                    </Link>
                }
            />

            <div className="p-4 space-y-5 max-w-md mx-auto">
                {/* Balance Card */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Total Saldo</p>
                        <h2 className="text-[28px] font-black tracking-tight mt-0.5">Rp{balance.toLocaleString('id-ID')}</h2>

                        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/10">
                            <div>
                                <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-semibold uppercase mb-0.5">
                                    <ArrowUpRight className="w-3 h-3" /> Masuk
                                </div>
                                <p className="text-sm font-bold">Rp{totalIn.toLocaleString('id-ID')}</p>
                            </div>
                            <div>
                                <div className="flex items-center gap-1 text-rose-400 text-[10px] font-semibold uppercase mb-0.5">
                                    <ArrowDownRight className="w-3 h-3" /> Keluar
                                </div>
                                <p className="text-sm font-bold">Rp{totalOut.toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                    </div>
                    <Wallet className="absolute -bottom-5 -right-5 w-28 h-28 text-slate-700/40 rotate-12" />
                </div>

                {/* Quick links */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
                    <Link href="/sales" className="shrink-0 bg-white border border-slate-100 text-slate-700 px-4 py-2 rounded-full text-[12px] font-semibold flex items-center gap-1.5 active:scale-95 transition-transform shadow-sm">
                        Riwayat Jual
                    </Link>
                    <Link href="/expenses/new" className="shrink-0 bg-white border border-slate-100 text-slate-700 px-4 py-2 rounded-full text-[12px] font-semibold flex items-center gap-1.5 active:scale-95 transition-transform shadow-sm">
                        + Biaya Operasional
                    </Link>
                </div>

                {/* Transaction History */}
                <div className="space-y-3">
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-0.5 flex items-center gap-1.5">
                        <History className="w-3.5 h-3.5" /> Riwayat Kas
                    </h3>

                    {!cashflow || cashflow.length === 0 ? (
                        <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-200">
                            <p className="text-slate-400 text-[13px]">Belum ada transaksi.</p>
                        </div>
                    ) : (
                        cashflow.map((c) => (
                            <div key={c.id} className="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center active:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`p-2 rounded-xl shrink-0 ${c.type === 'in' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                                        {c.type === 'in' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-[13px] text-slate-800 truncate">{c.note}</p>
                                        <p className="text-[10px] text-slate-400 font-medium uppercase">{format(c.date, 'dd MMM yy', { locale: id })} · {c.category}</p>
                                    </div>
                                </div>
                                <p className={`font-black text-[13px] whitespace-nowrap shrink-0 ml-3 ${c.type === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {c.type === 'in' ? '+' : '-'}Rp{c.amount.toLocaleString('id-ID')}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
