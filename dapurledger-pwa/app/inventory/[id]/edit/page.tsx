'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { db } from '@/lib/db';
import Header from '@/components/Header';
import { Save, Trash2 } from 'lucide-react';

export default function EditIngredientPage() {
    const router = useRouter();
    const params = useParams();
    const id = Number(params.id);

    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        unit: 'gram' as 'gram' | 'ml' | 'pcs',
        minStock: '' as string | number,
        currentStock: '' as string | number,
    });

    useEffect(() => {
        if (id) {
            db.ingredients.get(id).then(ing => {
                if (ing) {
                    setFormData({
                        name: ing.name,
                        brand: ing.brand,
                        unit: ing.unit,
                        minStock: ing.minStock || '',
                        currentStock: ing.currentStock ?? '',
                    });
                }
            });
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const minStockVal = formData.minStock === '' ? 0 : Number(formData.minStock);

        await db.ingredients.update(id, {
            name: formData.name,
            brand: formData.brand,
            unit: formData.unit,
            minStock: minStockVal,
            currentStock: formData.currentStock === '' ? 0 : Number(formData.currentStock),
        });

        router.push('/inventory');
    };

    const handleDelete = async () => {
        if (confirm('Hapus bahan ini? Data pembelian dan resep terkait mungkin akan terpengaruh.')) {
            await db.transaction('rw', [db.ingredients, db.purchases, db.recipes], async () => {
                await db.ingredients.delete(id);
                // Optionally delete related data, or let them stay (IndexedDB handles this simply)
                await db.purchases.where('ingredientId').equals(id).delete();
                await db.recipes.where('ingredientId').equals(id).delete();
            });
            router.push('/inventory');
        }
    };

    return (
        <div className="animate-slide-up">
            <Header title="Edit Bahan" showBack />

            <form onSubmit={handleSubmit} className="p-4 space-y-5 max-w-md mx-auto">
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                    <div>
                        <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-0.5">Nama Bahan</label>
                        <input
                            required
                            type="text"
                            placeholder="Contoh: Tepung Terigu"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all text-slate-800"
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
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all text-slate-800"
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
                        <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-0.5">Peringatan Stok Minimum (Opsional)</label>
                        <div className="relative">
                            <input
                                type="number"
                                placeholder="Kosongkan jika tidak perlu peringatan"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all text-slate-800"
                                value={formData.minStock}
                                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-[13px] font-medium">
                                {formData.unit}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-0.5">Jumlah Stok Saat Ini</label>
                        <div className="relative">
                            <input
                                type="number"
                                placeholder="0"
                                className="w-full px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-800 font-bold"
                                value={formData.currentStock}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-[13px] font-medium">
                                {formData.unit}
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1.5 ml-1">Ubah jumlah ini jika ada koreksi stok manual.</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="p-3.5 rounded-2xl bg-rose-50 text-rose-500 active:bg-rose-100 transition-all"
                    >
                        <Trash2 className="w-6 h-6" />
                    </button>
                    <button
                        type="submit"
                        className="flex-1 bg-sky-500 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all text-[15px]"
                    >
                        <Save className="w-5 h-5" />
                        Simpan Perubahan
                    </button>
                </div>
            </form>
        </div>
    );
}
