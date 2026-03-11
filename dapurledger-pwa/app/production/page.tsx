'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import Header from '@/components/Header';
import { Plus, History, Calendar, CheckCircle2, TrendingUp, ArrowUpRight, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function ProductionHistoryPage() {
    const batches = useLiveQuery(() => db.batches.orderBy('batchDate').reverse().toArray());
    const products = useLiveQuery(() => db.products.toArray());

    const handleDeleteBatch = async (id: number) => {
        if (!confirm('Hapus riwayat batch ini? (Catatan: Stok bahan tidak akan dikembalikan otomatis)')) return;
        await db.batches.delete(id);
    };

    return (
        <div className="animate-slide-up pb-20">
            <Header
                title="Riwayat Batch"
                action={
                    <Link href="/production/new" className="flex items-center gap-1.5 bg-sky-500 text-white pl-3 pr-4 py-2 rounded-full text-[13px] font-black active:scale-95 transition-transform shadow-lg shadow-sky-500/20">
                        <Plus className="w-4 h-4" /> BARU
                    </Link>
                }
            />

            <div className="p-4 space-y-4 max-w-md mx-auto">
                {!batches || batches.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 mt-10">
                        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6">
                            <History className="w-10 h-10 text-slate-200" />
                        </div>
                        <p className="text-slate-500 font-black text-lg">Belum ada riwayat</p>
                        <p className="text-sm text-slate-400 mt-2 max-w-[200px]">Mulai produksi batch pertama untuk melihat data HPP di sini.</p>
                        <Link href="/production/new" className="mt-8 bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold text-sm">Mulai Produksi</Link>
                    </div>
                ) : (
                    batches.map((b) => {
                        const product = products?.find(p => p.id === b.productId);
                        const hpp = b.hpp || 0;

                        return (
                            <div key={b.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5 text-[10px] font-black text-sky-500 uppercase tracking-widest mb-1.5">
                                            <Calendar className="w-3 h-3" />
                                            {format(b.batchDate, 'dd MMMM yyyy', { locale: id })}
                                        </div>
                                        <h3 className="font-black text-lg text-slate-800 truncate leading-tight">{product?.name || 'Produk Dihapus'}</h3>
                                    </div>
                                    <div className="flex gap-2 shrink-0 ml-3">
                                        <div className="bg-emerald-50 px-3 py-1.5 rounded-xl text-right">
                                            <p className="text-lg font-black text-emerald-600 leading-none">{b.totalPiecesProduced}</p>
                                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter mt-1">Pcs</p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteBatch(b.id!)}
                                            className="p-2 text-slate-300 hover:text-red-500 active:scale-90 transition-all"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">HPP per Unit</p>
                                        <p className="text-lg font-black text-slate-800">Rp{Math.round(hpp).toLocaleString('id-ID')}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Total Biaya</p>
                                        <p className="text-[14px] font-bold text-slate-600">Rp{Math.round(b.totalIngredientCost).toLocaleString('id-ID')}</p>
                                    </div>
                                </div>

                                {/* Quick Price Reference */}
                                <div className="mt-4 px-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estimasi Harga Jual</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-sky-50/50 p-2 rounded-xl border border-sky-100/50">
                                            <p className="text-[9px] font-black text-sky-600 uppercase">Dist</p>
                                            <p className="text-[13px] font-black text-slate-700">Rp{Math.round(hpp * 1.3).toLocaleString('id-ID')}</p>
                                        </div>
                                        <div className="flex-1 bg-amber-50/50 p-2 rounded-xl border border-amber-100/50">
                                            <p className="text-[9px] font-black text-amber-600 uppercase">Resel</p>
                                            <p className="text-[13px] font-black text-slate-700">Rp{Math.round(hpp * 1.6).toLocaleString('id-ID')}</p>
                                        </div>
                                        <div className="flex-1 bg-emerald-50/50 p-2 rounded-xl border border-emerald-100/50">
                                            <p className="text-[9px] font-black text-emerald-600 uppercase">Retail</p>
                                            <p className="text-[13px] font-black text-slate-700">Rp{Math.round(hpp * 2.0).toLocaleString('id-ID')}</p>
                                        </div>
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
