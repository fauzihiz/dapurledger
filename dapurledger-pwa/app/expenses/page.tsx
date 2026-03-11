'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import Header from '@/components/Header';
import { Wallet, Trash2, Calendar, FileText, Plus } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function ExpenseHistoryPage() {
    const expenses = useLiveQuery(() =>
        db.cashflow.where('category').equals('expense').toArray()
    );

    const sortedExpenses = expenses?.sort((a, b) => b.date.getTime() - a.date.getTime());

    const handleDelete = async (id: number) => {
        if (!confirm('Hapus catatan pengeluaran ini? Saldo Kas akan otomatis bertambah kembali.')) return;
        await db.cashflow.delete(id);
    };

    return (
        <div className="animate-slide-up pb-20">
            <Header
                title="Riwayat Biaya"
                action={
                    <Link href="/expenses/new" className="flex items-center gap-1.5 bg-red-500 text-white pl-3 pr-4 py-2 rounded-full text-[13px] font-black active:scale-95 transition-transform shadow-lg shadow-red-500/20">
                        <Plus className="w-4 h-4" /> BIAYA
                    </Link>
                }
            />

            <div className="p-4 space-y-4 max-w-md mx-auto">
                {!sortedExpenses || sortedExpenses.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 mt-10">
                        <div className="w-20 h-20 bg-amber-50 rounded-[2rem] flex items-center justify-center mb-6 text-amber-500/30">
                            <Wallet className="w-10 h-10" />
                        </div>
                        <p className="text-slate-500 font-black text-lg">Belum ada pengeluaran</p>
                        <p className="text-sm text-slate-400 mt-2">Catat biaya operasional seperti gas, listrik, atau sewa di sini.</p>
                        <Link href="/expenses/new" className="mt-8 bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold text-sm">Catat Biaya</Link>
                    </div>
                ) : (
                    sortedExpenses.map((e) => (
                        <div key={e.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-3xl rounded-full" />

                            <div className="flex justify-between items-start mb-4">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-red-500 uppercase tracking-widest mb-1.5 leading-none">
                                        <Calendar className="w-3 h-3" />
                                        {format(e.date, 'dd MMMM yyyy HH:mm', { locale: id })}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                                            <FileText className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <h3 className="font-black text-slate-800 truncate leading-tight">{e.note || 'Pengeluaran'}</h3>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(e.id!)}
                                    className="p-2 text-slate-300 hover:text-red-500 active:scale-90 transition-all z-10"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center group-hover:bg-red-50/50 transition-colors">
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Nominal</p>
                                <p className="text-xl font-black text-red-600 leading-none">Rp{Math.round(e.amount).toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
