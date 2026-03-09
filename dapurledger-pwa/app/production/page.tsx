'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import Header from '@/components/Header';
import { Plus, History, Calendar } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function ProductionHistoryPage() {
    const batches = useLiveQuery(() => db.batches.orderBy('batchDate').reverse().toArray());
    const products = useLiveQuery(() => db.products.toArray());

    return (
        <div className="animate-slide-up">
            <Header
                title="Produksi"
                action={
                    <Link href="/production/new" className="flex items-center gap-1 bg-sky-500 text-white pl-2.5 pr-3.5 py-1.5 rounded-full text-[13px] font-semibold active:scale-95 transition-transform">
                        <Plus className="w-4 h-4" /> Baru
                    </Link>
                }
            />

            <div className="p-4 space-y-3 max-w-md mx-auto">
                {!batches || batches.length === 0 ? (
                    <div className="bg-white rounded-2xl p-10 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 mt-4">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                            <History className="w-7 h-7 text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-semibold text-[15px]">Belum ada riwayat</p>
                        <p className="text-sm text-slate-400 mt-1">Mulai batch produksi pertama.</p>
                    </div>
                ) : (
                    batches.map((b) => {
                        const product = products?.find(p => p.id === b.productId);
                        return (
                            <div key={b.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                                <div className="flex justify-between items-start">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-sky-500 uppercase tracking-wider mb-0.5">
                                            <Calendar className="w-3 h-3" />
                                            {format(b.batchDate, 'dd MMM yyyy', { locale: id })}
                                        </div>
                                        <h3 className="font-bold text-[15px] text-slate-800 truncate">{product?.name || 'Produk Dihapus'}</h3>
                                    </div>
                                    <div className="text-right shrink-0 ml-3">
                                        <p className="text-lg font-black text-slate-800">{b.totalPiecesProduced}</p>
                                        <p className="text-[10px] font-semibold text-slate-400 uppercase">Pcs</p>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-semibold text-slate-400 uppercase">HPP / Unit</p>
                                        <p className="text-[14px] font-bold text-emerald-600">Rp{Math.round(b.hpp).toLocaleString('id-ID')}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-semibold text-slate-400 uppercase">Total Biaya</p>
                                        <p className="text-[14px] font-bold text-slate-700">Rp{Math.round(b.totalIngredientCost).toLocaleString('id-ID')}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
