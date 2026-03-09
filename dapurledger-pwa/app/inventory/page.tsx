'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import Header from '@/components/Header';
import { Plus, AlertTriangle, Package } from 'lucide-react';
import Link from 'next/link';

export default function InventoryPage() {
    const ingredients = useLiveQuery(() => db.ingredients.toArray());

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
                {!ingredients || ingredients.length === 0 ? (
                    <div className="bg-white rounded-2xl p-10 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 mt-4">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                            <Package className="w-7 h-7 text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-semibold text-[15px]">Belum ada bahan baku</p>
                        <p className="text-sm text-slate-400 mt-1">Tambahkan bahan pertama Anda.</p>
                    </div>
                ) : (
                    ingredients.map((ing) => {
                        const isLow = ing.currentStock <= ing.minStock;
                        return (
                            <div key={ing.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center active:bg-slate-50 transition-colors">
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
                                    <p className={`text-sm font-bold mt-1 ${isLow ? 'text-red-500' : 'text-slate-700'}`}>
                                        {ing.currentStock.toLocaleString()} {ing.unit}
                                    </p>
                                </div>
                                <Link
                                    href={`/inventory/purchase?id=${ing.id}`}
                                    className="shrink-0 bg-sky-50 text-sky-600 px-4 py-2.5 rounded-xl text-[13px] font-bold active:bg-sky-100 transition-colors ml-3"
                                >
                                    Beli
                                </Link>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
