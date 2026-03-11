'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import Header from '@/components/Header';
import { ShoppingBag, Calendar, ShoppingCart, TrendingUp, Filter } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function SalesHistoryPage() {
    const sales = useLiveQuery(() => db.sales.orderBy('date').reverse().toArray());
    const products = useLiveQuery(() => db.products.toArray());

    return (
        <div className="animate-slide-up pb-20">
            <Header
                title="Riwayat Jual"
                action={
                    <Link href="/sales/new" className="flex items-center gap-1.5 bg-sky-500 text-white pl-3 pr-4 py-2 rounded-full text-[13px] font-black active:scale-95 transition-transform shadow-lg shadow-sky-500/20">
                        <ShoppingBag className="w-4 h-4" /> JUAL
                    </Link>
                }
            />

            <div className="p-4 space-y-4 max-w-md mx-auto">
                {!sales || sales.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 mt-10">
                        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6">
                            <ShoppingCart className="w-10 h-10 text-slate-200" />
                        </div>
                        <p className="text-slate-500 font-black text-lg">Belum ada jualan</p>
                        <p className="text-sm text-slate-400 mt-2 max-w-[200px]">Catat penjualan pertama Anda untuk melihat laporan cuan di sini.</p>
                        <Link href="/sales/new" className="mt-8 bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold text-sm">Catat Jual</Link>
                    </div>
                ) : (
                    sales.map((s) => {
                        const product = products?.find(p => p.id === s.productId);
                        return (
                            <div key={s.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5 text-[10px] font-black text-sky-500 uppercase tracking-widest mb-1.5">
                                            <Calendar className="w-3 h-3" />
                                            {format(s.date, 'dd MMMM yyyy HH:mm', { locale: id })}
                                        </div>
                                        <h3 className="font-black text-lg text-slate-800 truncate leading-tight">{product?.name || 'Produk Dihapus'}</h3>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Pembeli: {s.type}</p>
                                    </div>
                                    <div className="bg-sky-50 px-3 py-1.5 rounded-xl text-right shrink-0 ml-3">
                                        <p className="text-lg font-black text-sky-600 leading-none">{s.quantity}</p>
                                        <p className="text-[10px] font-black text-sky-500 uppercase tracking-tighter mt-1">Pcs</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Total Terima</p>
                                        <p className="text-lg font-black text-slate-800">Rp{Math.round(s.totalRevenue).toLocaleString('id-ID')}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-wider mb-0.5">Estimasi Laba</p>
                                        <p className="text-[16px] font-black text-emerald-600">+ Rp{Math.round(s.estimatedProfit).toLocaleString('id-ID')}</p>
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
