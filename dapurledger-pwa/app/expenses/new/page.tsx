'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import Header from '@/components/Header';
import { Wallet, Save, Tag, FileText, AlertCircle } from 'lucide-react';

export default function NewExpensePage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        amount: '',
        category: 'expense' as const,
        note: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const amountNum = Number(formData.amount);
        if (amountNum <= 0) return;

        await db.cashflow.add({
            date: new Date(),
            type: 'out',
            amount: amountNum,
            category: 'expense',
            note: formData.note || 'Pengeluaran Operasional',
        });

        router.push('/');
    };

    return (
        <div className="animate-slide-up">
            <Header title="Catat Pengeluaran" showBack />

            <form onSubmit={handleSubmit} className="p-4 space-y-5 max-w-md mx-auto">
                <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                        <Wallet className="w-6 h-6 text-amber-500" />
                    </div>
                    <h2 className="text-[17px] font-black text-amber-900 mb-1">Pengeluaran Lain-lain</h2>
                    <p className="text-[11px] text-amber-700/70 font-bold uppercase tracking-widest">Listrik, Gas, Sewa, dll</p>
                </div>

                <div className="space-y-4">
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                        <div>
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nominal (Rp)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-black text-slate-400">Rp</span>
                                <input
                                    required
                                    type="number"
                                    placeholder="0"
                                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-[18px] font-black text-red-600 focus:ring-2 focus:ring-red-500 placeholder:text-slate-300"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Keterangan</label>
                            <div className="relative">
                                <FileText className="absolute left-4 top-3.5 w-5 h-5 text-slate-300" />
                                <textarea
                                    required
                                    placeholder="Misal: Bayar Gas 3kg"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-[15px] font-bold text-slate-700 focus:ring-2 focus:ring-sky-500 placeholder:text-slate-300 min-h-[100px]"
                                    value={formData.note}
                                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl flex gap-3 items-start border border-slate-100">
                        <AlertCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                            Pencatatan ini akan langsung mengurangi Saldo Kas di Dashboard Utama.
                        </p>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black text-[17px] shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                >
                    <Save className="w-5 h-5" />
                    SIMPAN PENGELUARAN
                </button>
            </form>
        </div>
    );
}
