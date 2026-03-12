'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import Header from '@/components/Header';
import {
    Scale,
    CheckCircle2,
    Plus,
    Search,
    ArrowRight,
    Zap,
    ChevronRight,
    ChevronLeft,
    TrendingUp,
    Store,
    Users,
    User,
    AlertCircle,
    PlusCircle,
    X
} from 'lucide-react';

type UsageMode = 'direct' | 'weighing';

interface UsageData {
    mode: UsageMode;
    v1: string; // direct qty or weight before
    v2: string; // weight after (only for weighing)
}

export default function NewProductionPage() {
    const router = useRouter();
    const products = useLiveQuery(() => db.products.toArray());
    const ingredients = useLiveQuery(() => db.ingredients.toArray());

    const [step, setStep] = useState(1);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [totalProduced, setTotalProduced] = useState<string>('0');
    const [searchQuery, setSearchQuery] = useState('');
    const [showIngSearch, setShowIngSearch] = useState(false);
    const [showNewProductForm, setShowNewProductForm] = useState(false);
    const [newProductName, setNewProductName] = useState('');

    // { ingredientId: UsageData }
    const [usage, setUsage] = useState<Record<number, UsageData>>({});

    const product = products?.find(p => p.id === selectedProductId);
    const recipe = useLiveQuery(() =>
        selectedProductId ? db.recipes.where('productId').equals(selectedProductId).toArray() : []
        , [selectedProductId]);

    // Initialize usage from recipe when product is selected
    useEffect(() => {
        if (recipe && recipe.length > 0 && Object.keys(usage).length === 0) {
            const initialUsage: Record<number, UsageData> = {};
            recipe.forEach(item => {
                initialUsage[item.ingredientId] = { mode: 'direct', v1: item.estimatedQty.toString(), v2: '' };
            });
            setUsage(initialUsage);
        }
    }, [recipe, selectedProductId]);

    const handleCreateProduct = async () => {
        if (!newProductName.trim()) return;
        const id = await db.products.add({
            name: newProductName,
            description: '',
            currentStock: 0,
            distributorPrice: 0,
            resellerPrice: 0,
            customerPrice: 0
        });
        setSelectedProductId(id as number);
        setNewProductName('');
        setShowNewProductForm(false);
        setStep(2);
    };

    const addIngredientToBatch = (ingId: number) => {
        if (usage[ingId]) return;
        setUsage(prev => ({ ...prev, [ingId]: { mode: 'direct', v1: '', v2: '' } }));
        setShowIngSearch(false);
        setSearchQuery('');
    };

    const removeIngredientFromBatch = (ingId: number) => {
        const newUsage = { ...usage };
        delete newUsage[ingId];
        setUsage(newUsage);
    };

    const updateUsage = (ingId: number, field: keyof UsageData, value: string) => {
        setUsage(prev => ({
            ...prev,
            [ingId]: { ...prev[ingId], [field]: value }
        }));
    };

    const calculateHPP = () => {
        let totalCost = 0;
        const totalProducedNum = totalProduced === '' ? 0 : Number(totalProduced);
        const usageDetails = Object.entries(usage).map(([ingIdStr, data]) => {
            const ingId = Number(ingIdStr);
            const ing = (ingredients || []).find(i => i.id === ingId);
            let qtyUsed = 0;
            if (data.mode === 'direct') {
                qtyUsed = data.v1 === '' ? 0 : Number(data.v1);
            } else {
                const before = data.v1 === '' ? 0 : Number(data.v1);
                const after = data.v2 === '' ? 0 : Number(data.v2);
                qtyUsed = Math.max(0, before - after);
            }
            const cost = qtyUsed * (ing?.averagePricePerUnit || 0);
            totalCost += cost;
            return { ingredientId: ingId, qtyUsed, cost, mode: data.mode, v1: data.v1, v2: data.v2 };
        });
        const hpp = totalProducedNum > 0 ? totalCost / totalProducedNum : 0;
        return { totalCost, usageDetails, hpp, totalProducedNum };
    };

    const stats = calculateHPP();

    const handleFinish = async () => {
        if (!selectedProductId) return;
        const { totalCost, usageDetails, hpp, totalProducedNum } = stats;

        await db.transaction('rw', [db.batches, db.ingredients, db.recipes, db.products], async () => {
            // 1. Add Batch
            await db.batches.add({
                batchDate: new Date(),
                productId: selectedProductId,
                totalPiecesProduced: totalProducedNum,
                totalIngredientCost: totalCost,
                hpp,
                ingredients: usageDetails.map(u => ({
                    ingredientId: u.ingredientId,
                    weightBefore: u.mode === 'weighing' ? Number(u.v1) : 0,
                    weightAfter: u.mode === 'weighing' ? Number(u.v2) : 0,
                    qtyUsed: u.qtyUsed,
                    cost: u.cost
                })),
            });

            // 2. Update Ingredient Stock
            for (const u of usageDetails) {
                const ing = await db.ingredients.get(u.ingredientId);
                if (ing) {
                    await db.ingredients.update(u.ingredientId, {
                        currentStock: Math.max(0, (ing.currentStock || 0) - u.qtyUsed),
                    });
                }
            }

            // 3. Update Recipe for this Product (Overwrite with current usage)
            await db.recipes.where('productId').equals(selectedProductId).delete();
            for (const u of usageDetails) {
                await db.recipes.add({
                    productId: selectedProductId,
                    ingredientId: u.ingredientId,
                    estimatedQty: u.qtyUsed // Use this batch's usage as the new baseline
                });
            }

            // 4. Update Finished Goods Stock
            const currentProd = await db.products.get(selectedProductId);
            if (currentProd) {
                await db.products.update(selectedProductId, {
                    currentStock: (currentProd.currentStock || 0) + totalProducedNum
                });
            }
        });
        router.push('/production');
    };

    return (
        <div className="animate-slide-up pb-20">
            <Header title="Produksi Baru" showBack />

            <div className="p-4 max-w-md mx-auto">
                <div className="flex justify-end mb-4 px-2">
                    <Link href="/production/products" className="text-[11px] font-black text-sky-500 uppercase tracking-widest flex items-center gap-1.5 hover:text-sky-600 transition-colors">
                        LIHAT DAFTAR PRODUK <ChevronRight className="w-3 h-3" />
                    </Link>
                </div>
                <div className="flex justify-between items-center mb-8 px-2 relative">
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className="flex flex-col items-center relative z-10">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-black transition-all ${step >= s ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' : 'bg-slate-100 text-slate-400'}`}>
                                {s}
                            </div>
                            {s < 4 && (
                                <div className={`absolute left-8 top-4 w-[calc(100vw/4)] h-[2px] -z-0 ${step > s ? 'bg-emerald-500' : 'bg-slate-100'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step 1: Select Product */}
                {step === 1 && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-1">
                            <h2 className="text-[17px] font-black text-slate-800">Apa yang dimasak?</h2>
                            <button onClick={() => setShowNewProductForm(true)} className="text-sky-500 text-[13px] font-black flex items-center gap-1">
                                <PlusCircle className="w-4 h-4" /> PRODUK BARU
                            </button>
                        </div>

                        {(products || []).length === 0 && !showNewProductForm ? (
                            <div className="bg-white p-10 rounded-3xl border border-dashed border-slate-200 text-center">
                                <p className="text-slate-400 text-sm font-medium">Belum ada produk.<br />Klik tombol di atas untuk membuat produk baru.</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {products?.map(p => (
                                    <button key={p.id} onClick={() => { setSelectedProductId(p.id!); setStep(2); }}
                                        className={`w-full p-4 rounded-2xl border text-left transition-all active:scale-[0.98] ${selectedProductId === p.id
                                            ? 'bg-sky-50 border-sky-500 ring-1 ring-sky-500 shadow-md'
                                            : 'bg-white border-slate-100 shadow-sm hover:border-sky-200'}`}>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-[15px] text-slate-800">{p.name}</p>
                                                <p className="text-[11px] text-slate-400 mt-0.5">{p.description || 'Pilih untuk gunakan resep terakhir'}</p>
                                            </div>
                                            <ChevronRight className={`w-5 h-5 ${selectedProductId === p.id ? 'text-sky-500' : 'text-slate-300'}`} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {showNewProductForm && (
                            <div className="bg-slate-800 p-6 rounded-3xl shadow-xl animate-in fade-in zoom-in duration-200">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-white font-black text-sm uppercase tracking-widest">Produk & Resep Baru</h3>
                                    <button onClick={() => setShowNewProductForm(false)} className="text-slate-400 hover:text-white">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <input type="text" placeholder="Nama Produk (misal: Risol)" autoFocus
                                    className="w-full px-4 py-3 bg-white/10 border-none rounded-2xl text-white font-bold placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500 mb-4"
                                    value={newProductName} onChange={(e) => setNewProductName(e.target.value)} />
                                <button onClick={handleCreateProduct} disabled={!newProductName.trim()}
                                    className="w-full bg-sky-500 text-white py-3.5 rounded-2xl font-black shadow-lg shadow-sky-500/20 disabled:opacity-50">
                                    BUAT & LANJUT
                                </button>
                            </div>
                        )}

                        {selectedProductId && !showNewProductForm && (
                            <button onClick={() => setStep(2)} className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black mt-4 flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 active:scale-95 transition-transform">
                                LANJUT KE RESEP <ArrowRight className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                )}

                {/* Step 2: Define Ingredients */}
                {step === 2 && product && (
                    <div className="space-y-4">
                        <div className="bg-sky-50 p-5 rounded-3xl flex items-center justify-between border border-sky-100 relative overflow-hidden">
                            <TrendingUp className="absolute -bottom-4 -right-4 w-20 h-20 text-sky-100/50" />
                            <div className="relative z-10">
                                <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest leading-none">Produksi</p>
                                <p className="text-xl font-black text-sky-900 mt-1">{product.name}</p>
                            </div>
                            <Scale className="w-8 h-8 text-sky-300 relative z-10" />
                        </div>

                        <div className="flex justify-between items-center px-1">
                            <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-widest leading-none">Bahan Riwayat / Baru</h3>
                            <button onClick={() => setShowIngSearch(true)} className="bg-sky-100 text-sky-600 px-4 py-2 rounded-full text-[12px] font-black flex items-center gap-1 active:scale-95 transition-transform">
                                <Plus className="w-3.5 h-3.5" /> TAMBAH BAHAN
                            </button>
                        </div>

                        {/* Usage List */}
                        <div className="space-y-3">
                            {Object.entries(usage).map(([ingIdStr, data]) => {
                                const ingId = Number(ingIdStr);
                                const ing = (ingredients || []).find(i => i.id === ingId);
                                if (!ing) return null;

                                return (
                                    <div key={ingId} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm animate-in slide-in-from-bottom-2">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="font-black text-[15px] text-slate-800 leading-tight">{ing.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                        {ing.brand} · Stok: {ing.currentStock} {ing.unit}
                                                    </p>
                                                    {ing.currentStock === 0 && (
                                                        <span className="flex items-center gap-0.5 text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest animate-pulse">
                                                            ⚠ STOK HABIS
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <button onClick={() => removeIngredientFromBatch(ingId)} className="text-slate-200 hover:text-red-400 p-1 transition-colors">
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="flex bg-slate-50 p-1 rounded-xl mb-4">
                                            <button onClick={() => updateUsage(ingId, 'mode', 'direct')}
                                                className={`flex-1 py-1.5 rounded-lg text-[11px] font-black transition-all ${data.mode === 'direct' ? 'bg-white shadow-sm text-sky-600' : 'text-slate-400 opacity-60'}`}>
                                                POTONG STOK
                                            </button>
                                            <button onClick={() => updateUsage(ingId, 'mode', 'weighing')}
                                                className={`flex-1 py-1.5 rounded-lg text-[11px] font-black transition-all ${data.mode === 'weighing' ? 'bg-white shadow-sm text-sky-600' : 'text-slate-400 opacity-60'}`}>
                                                TIMBANG SISA
                                            </button>
                                        </div>

                                        {data.mode === 'direct' ? (
                                            <div className="relative">
                                                <input type="number" placeholder="Jumlah pakai"
                                                    className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-[14px] font-bold focus:ring-2 focus:ring-sky-500"
                                                    value={data.v1} onChange={(e) => updateUsage(ingId, 'v1', e.target.value)} />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">{ing.unit}</span>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Timbang Awal</p>
                                                    <input type="number" placeholder="0"
                                                        className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-[14px] font-bold text-center focus:ring-2 focus:ring-sky-500"
                                                        value={data.v1} onChange={(e) => updateUsage(ingId, 'v1', e.target.value)} />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Timbang Sisa</p>
                                                    <input type="number" placeholder="0"
                                                        className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-[14px] font-bold text-center focus:ring-2 focus:ring-sky-500"
                                                        value={data.v2} onChange={(e) => updateUsage(ingId, 'v2', e.target.value)} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {Object.keys(usage).length === 0 && (
                            <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-3xl bg-white">
                                <p className="text-sm font-medium">Bahan belum ada.<br />Klik "Tambah Bahan" untuk mulai.</p>
                            </div>
                        )}

                        {/* Out of Stock Warning */}
                        {Object.entries(usage).some(([ingIdStr]) => {
                            const ing = (ingredients || []).find(i => i.id === Number(ingIdStr));
                            return ing && ing.currentStock === 0;
                        }) && (
                            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3">
                                <span className="text-xl leading-none">⚠️</span>
                                <div>
                                    <p className="text-[12px] font-black text-red-700 leading-tight">Ada bahan dengan stok habis!</p>
                                    <p className="text-[11px] text-red-500 mt-1 font-medium">Tambahkan stok dulu sebelum lanjut produksi, atau hapus bahan tersebut dari daftar.</p>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setStep(1)} className="p-4 bg-slate-100 rounded-2xl text-slate-600 active:scale-95 transition-transform flex items-center justify-center">
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                disabled={Object.keys(usage).length === 0 || Object.entries(usage).some(([ingIdStr]) => {
                                    const ing = (ingredients || []).find(i => i.id === Number(ingIdStr));
                                    return ing && ing.currentStock === 0;
                                })}
                                className="flex-1 bg-sky-500 text-white rounded-2xl font-black text-[15px] flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 disabled:opacity-50 active:scale-95 transition-transform"
                            >
                                INPUT HASIL PCS <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Produce Result */}
                {step === 3 && product && (
                    <div className="space-y-6">
                        <div className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100 text-center relative overflow-hidden">
                            <Zap className="absolute -top-6 -left-6 w-32 h-32 text-emerald-100 rotate-12" />
                            <div className="relative z-10">
                                <h2 className="text-[17px] font-black text-emerald-900 mb-2">Total Hasil Masak</h2>
                                <p className="text-[12px] text-emerald-600/80 font-bold mb-8 uppercase tracking-widest">Berapa PCS porsi yang dihasilkan?</p>

                                <div className="inline-flex items-center gap-4">
                                    <input type="number" placeholder="0" autoFocus
                                        className="w-32 bg-white border-none rounded-2xl text-center text-4xl font-black text-emerald-900 py-4 shadow-inner focus:ring-4 focus:ring-emerald-500/20"
                                        value={totalProduced} onChange={(e) => setTotalProduced(e.target.value)} />
                                    <span className="text-xl font-black text-emerald-900">PCS</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setStep(2)} className="p-4 bg-slate-100 rounded-2xl text-slate-600 active:scale-95 transition-transform">
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button onClick={() => setStep(4)} disabled={!totalProduced || totalProduced === '0'}
                                className="flex-1 bg-emerald-500 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 active:scale-95 transition-transform">
                                CEK HPP & HARGA <Zap className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Summary & Suggestions */}
                {step === 4 && product && (
                    <div className="space-y-5 animate-in zoom-in-95 duration-300">
                        <div className="bg-slate-800 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/20 blur-3xl rounded-full" />
                            <div className="relative z-10 text-center">
                                <p className="text-sky-300 text-[10px] font-black uppercase tracking-[0.2em] mb-2">BIAYA PRODUKSI (HPP)</p>
                                <h2 className="text-4xl font-black text-white leading-tight">Rp{Math.round(stats.hpp).toLocaleString('id-ID')}<span className="text-lg font-bold text-sky-400 opacity-60">/pcs</span></h2>

                                <div className="mt-6 flex justify-center gap-6 pt-6 border-t border-white/10">
                                    <div>
                                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">TOTAL BIAYA</p>
                                        <p className="text-base font-black">Rp{Math.round(stats.totalCost).toLocaleString('id-ID')}</p>
                                    </div>
                                    <div className="w-[1px] bg-white/10" />
                                    <div>
                                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">TOTAL HASIL</p>
                                        <p className="text-base font-black">{stats.totalProducedNum} PCS</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 px-1">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Saran Harga Jual</h3>
                            </div>

                            <div className="grid gap-2">
                                {[
                                    { label: 'Distributor', margin: 1.3, color: 'sky', icon: Store, note: 'Laba 30%' },
                                    { label: 'Reseller', margin: 1.6, color: 'amber', icon: Users, note: 'Laba 60%' },
                                    { label: 'Eceran / Customer', margin: 2.0, color: 'emerald', icon: User, note: 'Laba 100%' },
                                ].map((tier) => {
                                    const suggestedPrice = stats.hpp * tier.margin;
                                    const Icon = tier.icon;
                                    const bgColor = tier.color === 'sky' ? 'bg-sky-50' : tier.color === 'amber' ? 'bg-amber-50' : 'bg-emerald-50';
                                    const textColor = tier.color === 'sky' ? 'text-sky-700' : tier.color === 'amber' ? 'text-amber-700' : 'text-emerald-700';
                                    const iconColor = tier.color === 'sky' ? 'text-sky-500' : tier.color === 'amber' ? 'text-amber-500' : 'text-emerald-500';

                                    return (
                                        <div key={tier.label} className={`${bgColor} p-4 rounded-3xl flex items-center justify-between border border-transparent shadow-sm`}>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                                    <Icon className={`w-5 h-5 ${iconColor}`} />
                                                </div>
                                                <div>
                                                    <p className={`text-[10px] font-black uppercase tracking-widest ${textColor}`}>{tier.label}</p>
                                                    <p className="text-lg font-black text-slate-800">Rp{Math.round(suggestedPrice).toLocaleString('id-ID')}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-[9px] font-black ${textColor} bg-white/50 px-2.5 py-1 rounded-full border border-black/5`}>{tier.note}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-amber-50 p-4 rounded-3xl border border-amber-100/50 flex gap-4">
                            <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
                            <p className="text-[11px] text-amber-900/80 font-bold leading-relaxed">Resep yang Anda gunakan saat ini akan otomatis disimpan sebagai acuan masak berikutnya untuk produk ini.</p>
                        </div>

                        <button onClick={handleFinish} className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black text-[17px] shadow-xl shadow-slate-900/40 active:scale-95 transition-all flex items-center justify-center gap-3">
                            SIMPAN BATCH & RESEP <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        </button>
                    </div>
                )}
            </div>

            {/* Ingredient Search Modal */}
            {showIngSearch && (
                <div className="fixed inset-0 z-[60] bg-white animate-in slide-in-from-bottom duration-300">
                    <Header title="Pilih Bahan Stok" action={<button onClick={() => setShowIngSearch(false)} className="text-slate-400 font-bold px-2">BATAL</button>} />
                    <div className="p-4 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                            <input type="text" placeholder="Cari nama atau merk bahan..." autoFocus
                                className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-[16px] font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-sky-500"
                                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>

                        <div className="grid gap-3 overflow-y-auto max-h-[calc(100vh-200px)] no-scrollbar pb-10">
                            {(ingredients || []).filter(i =>
                                i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                i.brand.toLowerCase().includes(searchQuery.toLowerCase())
                            ).map(ing => (
                                <button key={ing.id} onClick={() => addIngredientToBatch(ing.id!)}
                                    className="w-full p-4 bg-white border border-slate-100 rounded-2xl text-left flex justify-between items-center active:bg-sky-50 transition-colors shadow-sm">
                                    <div>
                                        <p className="font-black text-slate-800 text-[16px] leading-tight">{ing.name}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{ing.brand} · {ing.currentStock} {ing.unit}</p>
                                    </div>
                                    <div className="bg-sky-50 p-2.5 rounded-xl">
                                        <Plus className="w-5 h-5 text-sky-500" />
                                    </div>
                                </button>
                            ))}
                            {ingredients && ingredients.length === 0 && (
                                <div className="py-20 text-center">
                                    <p className="text-slate-300 font-black uppercase tracking-widest italic">Stok Kosong</p>
                                    <button onClick={() => router.push('/inventory/new')} className="text-sky-500 text-sm font-black mt-4 underline">INPUT STOK DULU</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
