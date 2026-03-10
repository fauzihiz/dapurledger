'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import Header from '@/components/Header';
import { ShoppingCart } from 'lucide-react';

function PurchaseForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const ingredientId = Number(searchParams.get('id'));

    const ingredients = useLiveQuery(() => db.ingredients.toArray());
    const ingredient = ingredientId
        ? ingredients?.find(i => i.id === ingredientId)
        : null;

    const [selectedId, setSelectedId] = useState<number | null>(ingredientId || null);
    const [formData, setFormData] = useState({
        unitSize: '',
        quantityPurchased: '1',
        totalPrice: '',
    });

    const activeIngredient = selectedId
        ? ingredients?.find(i => i.id === selectedId)
        : ingredient;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeIngredient) return;

        const unitSizeNum = Number(formData.unitSize);
        const quantityNum = formData.quantityPurchased === '' ? 0 : Number(formData.quantityPurchased);
        const totalPriceNum = Number(formData.totalPrice);
        const totalWeight = unitSizeNum * quantityNum;
        const pricePerBaseUnit = totalWeight > 0 ? totalPriceNum / totalWeight : 0;

        await db.transaction('rw', [db.ingredients, db.purchases, db.cashflow], async () => {
            await db.purchases.add({
                ingredientId: activeIngredient.id!,
                purchaseDate: new Date(),
                brand: activeIngredient.brand,
                unitSize: formData.unitSize,
                quantityPurchased: quantityNum,
                totalWeight,
                unitPrice: quantityNum > 0 ? totalPriceNum / quantityNum : 0,
                totalPrice: totalPriceNum,
                pricePerBaseUnit,
            });

            const newStock = (activeIngredient.currentStock || 0) + totalWeight;
            const newAvgPrice = activeIngredient.averagePricePerUnit
                ? (activeIngredient.averagePricePerUnit + pricePerBaseUnit) / 2
                : pricePerBaseUnit;

            await db.ingredients.update(activeIngredient.id!, {
                currentStock: newStock,
                averagePricePerUnit: newAvgPrice,
            });

            await db.cashflow.add({
                date: new Date(),
                type: 'out',
                amount: totalPriceNum,
                category: 'purchase',
                note: `Beli ${activeIngredient.name} (${quantityNum}x ${formData.unitSize}${activeIngredient.unit})`,
            });
        });

        router.push('/inventory');
    };

    return (
        <div className="animate-slide-up">
            <Header title="Beli Bahan" showBack />

            <form onSubmit={handleSubmit} className="p-4 space-y-5 max-w-md mx-auto">
                {/* Select ingredient if not preselected */}
                {!ingredientId && (
                    <div>
                        <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-0.5">Pilih Bahan</label>
                        <select
                            required
                            className="w-full px-4 py-3 rounded-xl bg-white border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 text-[14px] font-medium text-slate-800"
                            value={selectedId || ''}
                            onChange={(e) => setSelectedId(Number(e.target.value))}
                        >
                            <option value="">Pilih...</option>
                            {ingredients?.map(i => (
                                <option key={i.id} value={i.id}>{i.name} ({i.brand})</option>
                            ))}
                        </select>
                    </div>
                )}

                {activeIngredient && (
                    <div className="bg-sky-50 p-4 rounded-2xl flex items-center justify-between border border-sky-100">
                        <div>
                            <p className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">Stok Saat Ini</p>
                            <p className="text-xl font-black text-sky-900">{activeIngredient.currentStock.toLocaleString()} {activeIngredient.unit}</p>
                        </div>
                        <p className="text-[13px] font-medium text-sky-600">{activeIngredient.brand}</p>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-0.5">
                            Ukuran Kemasan ({activeIngredient?.unit || 'unit'})
                        </label>
                        <input
                            required
                            type="number"
                            placeholder="Misal: 1000 (untuk 1kg)"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 placeholder:text-slate-300"
                            value={formData.unitSize}
                            onChange={(e) => setFormData({ ...formData, unitSize: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-0.5">Jumlah Kemasan</label>
                        <input
                            required
                            type="number"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
                            value={formData.quantityPurchased}
                            onChange={(e) => setFormData({ ...formData, quantityPurchased: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-0.5">Total Harga (Rp)</label>
                        <input
                            required
                            type="number"
                            placeholder="0"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold text-sky-600 placeholder:text-slate-300"
                            value={formData.totalPrice}
                            onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={!activeIngredient}
                    className="w-full bg-sky-500 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all text-[15px] disabled:opacity-50"
                >
                    <ShoppingCart className="w-5 h-5" />
                    Catat Pembelian
                </button>
            </form>
        </div>
    );
}

export default function PurchasePage() {
    return (
        <Suspense fallback={<div className="p-4 text-center text-slate-400">Memuat...</div>}>
            <PurchaseForm />
        </Suspense>
    );
}
