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
        minStock: '' as string | number, // Changed to string to handle empty input
    });

    // Optional initial purchase state
    const [purchaseData, setPurchaseData] = useState({
        hasPurchase: false,
        unitSize: '',
        quantity: 1,
        totalPrice: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const minStockVal = formData.minStock === '' ? 0 : Number(formData.minStock);

        await db.transaction('rw', [db.ingredients, db.purchases, db.cashflow], async () => {
            // 1. Add Ingredient
            const ingredientId = await db.ingredients.add({
                name: formData.name,
                brand: formData.brand,
                unit: formData.unit,
                minStock: minStockVal,
                currentStock: 0,
                averagePricePerUnit: 0,
            });

            // 2. Optional: Add Initial Purchase
            if (purchaseData.hasPurchase && purchaseData.unitSize && purchaseData.totalPrice) {
                const unitSizeNum = Number(purchaseData.unitSize);
                const quantityNum = Number(purchaseData.quantity);
                const totalPriceNum = Number(purchaseData.totalPrice);
                const totalWeight = unitSizeNum * quantityNum;
                const pricePerBaseUnit = totalPriceNum / totalWeight;

                await db.purchases.add({
                    ingredientId: ingredientId as number,
                    purchaseDate: new Date(),
                    brand: formData.brand,
                    unitSize: purchaseData.unitSize,
                    quantityPurchased: quantityNum,
                    totalWeight,
                    unitPrice: totalPriceNum / quantityNum,
                    totalPrice: totalPriceNum,
                    pricePerBaseUnit,
                });

                await db.ingredients.update(ingredientId, {
                    currentStock: totalWeight,
                    averagePricePerUnit: pricePerBaseUnit,
                });

                await db.cashflow.add({
                    date: new Date(),
                    type: 'out',
                    amount: totalPriceNum,
                    category: 'purchase',
                    note: `Stok Awal: ${formData.name} (${quantityNum}x ${purchaseData.unitSize}${formData.unit})`,
                });
            }
        });

        router.push('/inventory');
    };

    return (
        <div className="animate-slide-up">
            <Header title="Tambah Bahan" showBack />

            <form onSubmit={handleSubmit} className="p-4 space-y-5 max-w-md mx-auto">
                <div className="space-y-4">
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Informasi Dasar</h3>
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
                            <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-0.5">Peringatan Stok Minimum (Opsional)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    placeholder="Kosongkan jika tidak perlu peringatan"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all text-slate-800 placeholder:text-slate-300"
                                    value={formData.minStock}
                                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-[13px] font-medium">
                                    {formData.unit}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Stok Awal (Opsional)</h3>
                            <button
                                type="button"
                                onClick={() => setPurchaseData({ ...purchaseData, hasPurchase: !purchaseData.hasPurchase })}
                                className={`text-[11px] font-bold px-3 py-1 rounded-full transition-all ${purchaseData.hasPurchase ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-400'}`}
                            >
                                {purchaseData.hasPurchase ? 'Aktif' : 'Tambah Stok Awal?'}
                            </button>
                        </div>

                        {purchaseData.hasPurchase && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div>
                                    <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-0.5">Ukuran Per Kemasan ({formData.unit})</label>
                                    <input
                                        type="number"
                                        placeholder="Misal: 1000"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
                                        value={purchaseData.unitSize}
                                        onChange={(e) => setPurchaseData({ ...purchaseData, unitSize: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-0.5">Jumlah Beli</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
                                            value={purchaseData.quantity}
                                            onChange={(e) => setPurchaseData({ ...purchaseData, quantity: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-0.5">Total Harga (Rp)</label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sky-600 font-bold"
                                            value={purchaseData.totalPrice}
                                            onChange={(e) => setPurchaseData({ ...purchaseData, totalPrice: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
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
