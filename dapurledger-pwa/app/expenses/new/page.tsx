'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import Header from '@/components/Header';
import { Save, Receipt } from 'lucide-react';

export default function NewExpensePage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        amount: '',
        note: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await db.cashflow.add({
            date: new Date(),
            type: 'out',
            amount: Number(formData.amount),
            category: 'expense',
            note: formData.note || 'Biaya operasional',
        });
        router.push('/stats');
    };

    return (
        <div className="animate-slide-up">
            <Header title="Biaya Operasional" showBack />

            <form onSubmit={handleSubmit} className="p-4 space-y-5 max-w-md mx-auto">
                <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 flex items-center gap-4">
                    <div className="bg-white p-2.5 rounded-xl shadow-sm">
                        <Receipt className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                        <p className="font-bold text-[15px] text-amber-900">Biaya Keluar</p>
                        <p className="text-[12px] text-amber-700 mt-0.5">Gas, packaging, sewa, dll.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-0.5">Jumlah (Rp)</label>
                        <input required type="number" placeholder="0"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-amber-600 text-lg placeholder:text-slate-300"
                            value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
                    </div>

                    <div>
                        <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-0.5">Keterangan</label>
                        <textarea
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 text-[14px] font-medium min-h-[80px] resize-none placeholder:text-slate-300"
                            placeholder="Contoh: Gas elpiji 3kg, Plastik kemasan"
                            value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} />
                    </div>
                </div>

                <button type="submit"
                    className="w-full bg-amber-500 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all text-[15px]">
                    <Save className="w-5 h-5" /> Simpan Biaya
                </button>
            </form>
        </div>
    );
}
