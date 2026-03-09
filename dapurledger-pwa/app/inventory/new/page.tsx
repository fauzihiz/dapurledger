'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import Header from '@/components/Header';
import { Save } from 'lucide-react';

export default function NewIngredientPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        unit: 'gram' as 'gram' | 'ml' | 'pcs',
        minStock: 0,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await db.ingredients.add({
            ...formData,
            currentStock: 0,
            averagePricePerUnit: 0,
        });
        router.push('/inventory');
    };

    return (
        <div className="animate-slide-up">
            <Header title="Tambah Bahan" showBack />

            <form onSubmit={handleSubmit} className="p-4 space-y-5 max-w-md mx-auto">
                <div className="space-y-4">
                    <div>
                        <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-0.5">Nama Bahan</label>
                        <input
                            required
                            type="text"
                            placeholder="Contoh: Tepung Terigu"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all text-slate-800 placeholder:text-slate-300"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-0.5">Merek</label>
                        <input
                            required
                            type="text"
                            placeholder="Contoh: Segitiga Biru"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all text-slate-800 placeholder:text-slate-300"
                            value={formData.brand}
                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-0.5">Satuan Dasar</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['gram', 'ml', 'pcs'] as const).map((u) => (
                                <button
                                    key={u}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, unit: u })}
                                    className={`py-3 rounded-xl text-[13px] font-bold transition-all ${formData.unit === u
                                            ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                                            : 'bg-slate-50 text-slate-400 border border-slate-100'
                                        }`}
                                >
                                    {u}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-0.5">Peringatan Stok Minimum</label>
                        <div className="relative">
                            <input
                                type="number"
                                placeholder="0"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all text-slate-800 placeholder:text-slate-300"
                                value={formData.minStock || ''}
                                onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-[13px] font-medium">
                                {formData.unit}
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-sky-500 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all text-[15px]"
                >
                    <Save className="w-5 h-5" />
                    Simpan Bahan
                </button>
            </form>
        </div>
    );
}
