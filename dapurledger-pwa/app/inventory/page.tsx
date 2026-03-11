'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import Header from '@/components/Header';
import { Plus, AlertTriangle, Package, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function InventoryPage() {
    const data = useLiveQuery(async () => {
        const ingredients = await db.ingredients.toArray();
        const purchases = await db.purchases.toArray();
        return ingredients.map(ing => {
            const ingPurchases = purchases
                .filter(p => p.ingredientId === ing.id)
                .sort((a, b) => b.purchaseDate.getTime() - a.purchaseDate.getTime());
            return {
                ...ing,
                latestPurchase: ingPurchases[0] || null
            };
        });
    });

    const handleDelete = async (id: number) => {
        if (!confirm('Hapus bahan ini? Riwayat pembelian dan resep yang menggunakan bahan ini akan terpengaruh.')) return;
        await db.transaction('rw', [db.ingredients, db.purchases, db.recipes], async () => {
            await db.purchases.where('ingredientId').equals(id).delete();
            await db.recipes.where('ingredientId').equals(id).delete();
            await db.ingredients.delete(id);
        });
    };

    return (
        <div className="animate-slide-up">
            <Header
                title="Stok Bahan"
                action={
                    <Link href="/inventory/new" className="flex items-center gap-1 bg-sky-500 text-white pl-2.5 pr-3.5 py-1.5 rounded-full text-[13px] font-semibold active:scale-95 transition-transform">
                        <Plus className="w-4 h-4" /> Tambah
                    </Link>
                }
            />

            <div className="p-4 space-y-3 max-w-md mx-auto">
                {!data || data.length === 0 ? (
                    <div className="bg-white rounded-2xl p-10 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 mt-4">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                            <Package className="w-7 h-7 text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-semibold text-[15px]">Belum ada bahan baku</p>
                        <p className="text-sm text-slate-400 mt-1">Tambahkan bahan pertama Anda.</p>
                    </div>
                ) : (
                    data.map((ing) => {
                        const isLow = (ing.minStock ?? 0) > 0 && ing.currentStock <= ing.minStock;
                        return (
                            <div key={ing.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3 active:bg-slate-50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-[15px] text-slate-800 truncate">{ing.name}</h3>
                                            {isLow && (
                                                <span className="shrink-0 flex items-center gap-0.5 text-[9px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full font-bold uppercase">
                                                    <AlertTriangle className="w-2.5 h-2.5" /> Low
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[12px] text-slate-400 font-medium">{ing.brand}</p>
                                    </div>
                                    <div className="flex items-center gap-2 ml-3">
                                        <Link
                                            href={`/inventory/${ing.id}/edit`}
                                            className="p-2.5 rounded-xl bg-slate-50 text-slate-400 active:bg-slate-100 transition-colors"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(ing.id!)}
                                            className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 active:bg-slate-100 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-between items-end border-t border-slate-50 pt-3">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Sisa Stok</p>
                                        <p className={`text-lg font-black ${isLow ? 'text-red-500' : 'text-slate-800'}`}>
                                            {ing.currentStock.toLocaleString()} <span className="text-[13px] font-bold text-slate-400">{ing.unit}</span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        {ing.latestPurchase ? (
                                            <>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Harga Terakhir</p>
                                                <p className="text-[13px] font-bold text-sky-600">
                                                    Rp{ing.latestPurchase.unitPrice.toLocaleString('id-ID')}
                                                    <span className="text-[10px] text-slate-400 font-medium ml-1">/{ing.latestPurchase.unitSize}{ing.unit}</span>
                                                </p>
                                            </>
                                        ) : (
                                            <p className="text-[11px] text-slate-300 italic">Belum ada data harga</p>
                                        )}
                                    </div>
                                </div>

                                <Link
                                    href={`/inventory/purchase?id=${ing.id}`}
                                    className="w-full bg-sky-50 text-sky-600 py-2.5 rounded-xl text-[13px] font-bold text-center active:bg-sky-100 transition-colors"
                                >
                                    Beli Stok Baru
                                </Link>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
