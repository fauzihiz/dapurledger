'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import Header from '@/components/Header';
import { Plus, ShoppingCart, Calendar, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function SalesHistoryPage() {
    const sales = useLiveQuery(() => db.sales.orderBy('date').reverse().toArray());
    const products = useLiveQuery(() => db.products.toArray());

    return (
        <div className="animate-slide-up">
            <Header
                title="Penjualan"
                showBack
                action={
                    <Link href="/sales/new" className="flex items-center gap-1 bg-emerald-500 text-white pl-2.5 pr-3.5 py-1.5 rounded-full text-[13px] font-semibold active:scale-95 transition-transform">
                        <Plus className="w-4 h-4" /> Jual
                    </Link>
                }
            />

            <div className="p-4 space-y-3 max-w-md mx-auto">
                {!sales || sales.length === 0 ? (
                    <div className="bg-white rounded-2xl p-10 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 mt-4">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                            <ShoppingCart className="w-7 h-7 text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-semibold text-[15px]">Belum ada transaksi</p>
                        <p className="text-sm text-slate-400 mt-1">Catat penjualan pertama!</p>
                    </div>
                ) : (
                    sales.map((s) => {
                        const product = products?.find(p => p.id === s.productId);
                        return (
                            <div key={s.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                                <div className="flex justify-between items-start">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-500 uppercase tracking-wider mb-0.5">
                                            <Calendar className="w-3 h-3" />
                                            {format(s.date, 'dd MMM yy HH:mm', { locale: id })}
                                        </div>
                                        <h3 className="font-bold text-[15px] text-slate-800 truncate">{product?.name || 'Dihapus'}</h3>
                                        <p className="text-[11px] font-medium text-slate-400 uppercase">{s.type} · {s.quantity} pcs</p>
                                    </div>
                                    <div className="text-right shrink-0 ml-3">
                                        <p className="text-[15px] font-black text-emerald-600">+Rp{s.totalRevenue.toLocaleString('id-ID')}</p>
                                        <p className="text-[10px] font-medium text-slate-400 flex items-center justify-end gap-0.5">
                                            Laba Rp{Math.round(s.estimatedProfit).toLocaleString('id-ID')} <ArrowUpRight className="w-2.5 h-2.5" />
                                        </p>
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
