'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import Header from '@/components/Header';
import { Save, User, Users, Store, TrendingUp } from 'lucide-react';

export default function NewSalePage() {
    const router = useRouter();
    const products = useLiveQuery(() => db.products.toArray());
    const batches = useLiveQuery(() => db.batches.toArray());

    const [productId, setProductId] = useState<number | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [salesType, setSalesType] = useState<'customer' | 'reseller' | 'distributor'>('customer');

    const selectedProduct = products?.find(p => p.id === productId);
    const latestBatch = batches?.filter(b => b.productId === productId).sort((a, b) => b.batchDate.getTime() - a.batchDate.getTime())[0];
    const estHpp = latestBatch?.hpp || 0;

    const getPrice = () => {
        if (!selectedProduct) return 0;
        if (salesType === 'customer') return selectedProduct.customerPrice;
        if (salesType === 'reseller') return selectedProduct.resellerPrice;
        return selectedProduct.distributorPrice;
    };

    const revenue = getPrice() * quantity;
    const estProfit = (getPrice() - estHpp) * quantity;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productId || !selectedProduct) return;

        await db.transaction('rw', [db.sales, db.cashflow], async () => {
            await db.sales.add({
                date: new Date(), productId, quantity,
                priceEach: getPrice(), totalRevenue: revenue,
                type: salesType, estimatedProfit: estProfit,
            });
            await db.cashflow.add({
                date: new Date(), type: 'in', amount: revenue,
                category: 'sale',
                note: `Jual ${quantity} ${selectedProduct.name} (${salesType})`,
            });
        });
        router.push('/sales');
    };

    return (
        <div className="animate-slide-up">
            <Header title="Catat Penjualan" showBack />

            <form onSubmit={handleSubmit} className="p-4 space-y-5 max-w-md mx-auto">
                <div className="space-y-4">
                    <div>
                        <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-0.5">Produk</label>
                        <select required
                            className="w-full px-4 py-3 rounded-xl bg-white border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 text-[14px] font-medium text-slate-800"
                            value={productId || ''} onChange={(e) => setProductId(Number(e.target.value))}>
                            <option value="">Pilih...</option>
                            {products?.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-0.5">Jumlah (Pcs)</label>
                        <input required type="number"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 font-bold"
                            value={quantity || ''} onChange={(e) => setQuantity(Number(e.target.value))} />
                    </div>

                    <div>
                        <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-0.5">Tipe Penjualan</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 'distributor', label: 'Distro', icon: Store },
                                { id: 'reseller', label: 'Resell', icon: Users },
                                { id: 'customer', label: 'Eceran', icon: User },
                            ].map((t) => (
                                <button key={t.id} type="button" onClick={() => setSalesType(t.id as any)}
                                    className={`py-3 rounded-xl flex flex-col items-center gap-1 transition-all border ${salesType === t.id
                                            ? 'bg-sky-500 border-sky-500 text-white shadow-lg shadow-sky-500/25'
                                            : 'bg-white border-slate-100 text-slate-400'
                                        }`}>
                                    <t.icon className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase">{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {selectedProduct && (
                    <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 space-y-3">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Total Pendapatan</p>
                                <p className="text-2xl font-black text-emerald-900">Rp{revenue.toLocaleString('id-ID')}</p>
                            </div>
                            <p className="text-[13px] font-bold text-emerald-700">@Rp{getPrice().toLocaleString('id-ID')}</p>
                        </div>
                        <div className="pt-3 border-t border-emerald-100 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                            <p className="text-[13px] font-bold text-emerald-700">Est. Laba: Rp{estProfit.toLocaleString('id-ID')}</p>
                            <p className="text-[10px] text-emerald-500 ml-auto">HPP: Rp{Math.round(estHpp)}</p>
                        </div>
                    </div>
                )}

                <button type="submit" disabled={!productId}
                    className="w-full bg-slate-800 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 text-[15px] active:scale-[0.98] transition-all disabled:opacity-50">
                    <Save className="w-5 h-5" /> Simpan Transaksi
                </button>
            </form>
        </div>
    );
}
