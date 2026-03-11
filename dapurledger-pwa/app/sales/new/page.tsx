'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import Header from '@/components/Header';
import {
    ShoppingBag,
    ArrowRight,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    Store,
    Users,
    User,
    Package
} from 'lucide-react';

export default function NewSalePage() {
    const router = useRouter();
    const products = useLiveQuery(() => db.products.toArray());

    const [step, setStep] = useState(1);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [qty, setQty] = useState<string>('1');
    const [price, setPrice] = useState<string>('');
    const [tier, setTier] = useState<'distributor' | 'reseller' | 'customer'>('customer');

    const product = products?.find(p => p.id === selectedProductId);

    // Get latest batch to find HPP
    const latestBatch = useLiveQuery(async () => {
        if (!selectedProductId) return null;
        const batches = await db.batches
            .where('productId')
            .equals(selectedProductId)
            .toArray();
        return batches.sort((a, b) => b.batchDate.getTime() - a.batchDate.getTime())[0];
    }, [selectedProductId]);

    const lastHpp = latestBatch?.hpp || 0;

    const handleTierChange = (newTier: 'distributor' | 'reseller' | 'customer') => {
        setTier(newTier);
        const margin = newTier === 'distributor' ? 1.3 : newTier === 'reseller' ? 1.6 : 2.0;
        setPrice(Math.round(lastHpp * margin).toString());
    };

    const handleSave = async () => {
        if (!selectedProductId || !product) return;

        const qtyNum = Number(qty);
        const priceNum = Number(price);
        const revenue = qtyNum * priceNum;
        const profit = revenue - (qtyNum * lastHpp);

        await db.transaction('rw', [db.products, db.sales, db.cashflow], async () => {
            // 1. Add Sale
            await db.sales.add({
                date: new Date(),
                productId: selectedProductId,
                quantity: qtyNum,
                priceEach: priceNum,
                totalRevenue: revenue,
                type: tier,
                estimatedProfit: profit
            });

            // 2. Update Product Stock
            await db.products.update(selectedProductId, {
                currentStock: Math.max(0, (product.currentStock || 0) - qtyNum)
            });

            // 3. Add to Cashflow
            await db.cashflow.add({
                date: new Date(),
                type: 'in',
                amount: revenue,
                category: 'sale',
                note: `Jual ${product.name} (${qtyNum} pcs) - ${tier}`
            });
        });

        router.push('/');
    };

    return (
        <div className="animate-slide-up pb-20">
            <Header title="Catat Penjualan" showBack />

            <div className="p-4 max-w-md mx-auto">
                {/* Progress */}
                <div className="flex justify-between items-center mb-8 px-4 relative">
                    {[1, 2].map((s) => (
                        <div key={s} className="flex flex-col items-center relative z-10 w-1/2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-black transition-all ${step >= s ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' : 'bg-slate-100 text-slate-400'}`}>
                                {s}
                            </div>
                            <p className={`text-[10px] font-black uppercase tracking-widest mt-2 ${step >= s ? 'text-sky-600' : 'text-slate-400'}`}>
                                {s === 1 ? 'Pilih Produk' : 'Detail Jual'}
                            </p>
                        </div>
                    ))}
                    <div className={`absolute left-[25%] right-[25%] top-4 h-[2px] -z-0 ${step > 1 ? 'bg-sky-500' : 'bg-slate-100'}`} />
                </div>

                {/* Step 1: Select Product */}
                {step === 1 && (
                    <div className="space-y-4">
                        <h2 className="text-[17px] font-black text-slate-800 px-1">Produk mana yang terjual?</h2>
                        <div className="grid gap-3">
                            {(products || []).length === 0 ? (
                                <div className="bg-white p-10 rounded-3xl border border-dashed border-slate-200 text-center">
                                    <p className="text-slate-400 text-sm font-medium">Belum ada produk.<br />Masak dulu di menu Produksi.</p>
                                </div>
                            ) : (
                                products?.map(p => (
                                    <button key={p.id}
                                        onClick={() => {
                                            setSelectedProductId(p.id!);
                                            // Pre-calculate price for default tier (customer) if possible
                                            setStep(2);
                                        }}
                                        className={`w-full p-4 rounded-2xl border text-left transition-all active:scale-[0.98] ${selectedProductId === p.id
                                            ? 'bg-sky-50 border-sky-500 ring-1 ring-sky-500 shadow-md'
                                            : 'bg-white border-slate-100 shadow-sm'}`}>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-black text-[15px] text-slate-800">{p.name}</p>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <Package className="w-3 h-3 text-slate-400" />
                                                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Stok: {p.currentStock || 0} PCS</p>
                                                </div>
                                            </div>
                                            <ChevronRight className={`w-5 h-5 ${selectedProductId === p.id ? 'text-sky-500' : 'text-slate-300'}`} />
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Step 2: Detail Jual */}
                {step === 2 && product && (
                    <div className="space-y-6 animate-in slide-in-from-right duration-300">
                        <div className="bg-sky-50 p-5 rounded-3xl border border-sky-100">
                            <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest leading-none">Menjual Produk</p>
                            <div className="flex justify-between items-end mt-2">
                                <h3 className="text-xl font-black text-sky-900">{product.name}</h3>
                                <p className="text-[11px] font-bold text-sky-700 bg-white/50 px-3 py-1 rounded-full border border-sky-100">Sisa Stok: {product.currentStock} pcs</p>
                            </div>
                        </div>

                        {/* Customer Tier */}
                        <div className="space-y-3">
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Tipe Pembeli & Harga</h4>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: 'distributor', icon: Store, label: 'Dist' },
                                    { id: 'reseller', icon: Users, label: 'Resel' },
                                    { id: 'customer', icon: User, label: 'Retail' },
                                ].map((t) => {
                                    const Icon = t.icon;
                                    const active = tier === t.id;
                                    return (
                                        <button key={t.id} onClick={() => handleTierChange(t.id as any)}
                                            className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${active
                                                ? 'bg-sky-500 border-sky-500 text-white shadow-lg shadow-sky-500/20'
                                                : 'bg-white border-slate-100 text-slate-400'}`}>
                                            <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400'}`} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{t.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Jumlah Jual</label>
                                <div className="relative">
                                    <input type="number"
                                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-[16px] font-black focus:ring-2 focus:ring-sky-500"
                                        value={qty} onFocus={(e) => e.target.select()} onChange={(e) => setQty(e.target.value)} />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-400 uppercase">PCS</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Harga / PCS</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-black text-slate-400">Rp</span>
                                    <input type="number"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-[16px] font-black text-sky-600 focus:ring-2 focus:ring-sky-500"
                                        value={price} onFocus={(e) => e.target.select()} onChange={(e) => setPrice(e.target.value)} />
                                </div>
                            </div>
                        </div>

                        <div className="p-5 bg-slate-800 rounded-[2rem] text-white overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 blur-3xl rounded-full" />
                            <div className="relative z-10 flex justify-between items-center">
                                <div>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Terima Uang</p>
                                    <p className="text-2xl font-black">Rp{(Number(qty) * Number(price)).toLocaleString('id-ID')}</p>
                                </div>
                                <ShoppingBag className="w-10 h-10 text-sky-500/30" />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-6">
                            <button onClick={() => setStep(1)} className="p-4 bg-slate-100 rounded-2xl text-slate-600 active:scale-95 transition-transform">
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button onClick={handleSave} disabled={!qty || !price || Number(qty) <= 0}
                                className="flex-1 bg-sky-500 text-white rounded-2xl font-black text-[17px] flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 active:scale-95 transition-all">
                                SIMPAN PENJUALAN <CheckCircle2 className="w-6 h-6 text-sky-200" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
