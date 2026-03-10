'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import Header from '@/components/Header';
import { Scale, CheckCircle2 } from 'lucide-react';

export default function NewProductionPage() {
    const router = useRouter();
    const products = useLiveQuery(() => db.products.toArray());
    const ingredients = useLiveQuery(() => db.ingredients.toArray());

    const [step, setStep] = useState(1);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [totalProduced, setTotalProduced] = useState<string>('0');
    const [weights, setWeights] = useState<Record<number, { before: string; after: string }>>({});

    const product = products?.find(p => p.id === selectedProductId);
    const recipe = useLiveQuery(() =>
        selectedProductId ? db.recipes.where('productId').equals(selectedProductId).toArray() : []
        , [selectedProductId]);

    const handleWeightChange = (ingId: number, type: 'before' | 'after', value: string) => {
        setWeights(prev => ({ ...prev, [ingId]: { ...prev[ingId], [type]: value } }));
    };

    const calculateHPP = () => {
        let totalCost = 0;
        const totalProducedNum = totalProduced === '' ? 0 : Number(totalProduced);
        const usageDetails = recipe?.map(item => {
            const w = weights[item.ingredientId] || { before: '0', after: '0' };
            const beforeNum = w.before === '' ? 0 : Number(w.before);
            const afterNum = w.after === '' ? 0 : Number(w.after);
            const used = Math.max(0, beforeNum - afterNum);
            const ing = ingredients?.find(i => i.id === item.ingredientId);
            const cost = used * (ing?.averagePricePerUnit || 0);
            totalCost += cost;
            return { ingredientId: item.ingredientId, weightBefore: beforeNum, weightAfter: afterNum, qtyUsed: used, cost };
        }) || [];
        return { totalCost, usageDetails, hpp: totalProducedNum > 0 ? totalCost / totalProducedNum : 0 };
    };

    const handleFinish = async () => {
        if (!selectedProductId) return;
        const { totalCost, usageDetails, hpp } = calculateHPP();

        await db.transaction('rw', [db.batches, db.ingredients], async () => {
            await db.batches.add({
                batchDate: new Date(),
                productId: selectedProductId,
                totalPiecesProduced: totalProduced === '' ? 0 : Number(totalProduced),
                totalIngredientCost: totalCost,
                hpp,
                ingredients: usageDetails,
            });
            for (const usage of usageDetails) {
                const ing = await db.ingredients.get(usage.ingredientId);
                if (ing) {
                    await db.ingredients.update(usage.ingredientId, {
                        currentStock: Math.max(0, (ing.currentStock || 0) - usage.qtyUsed),
                    });
                }
            }
        });
        router.push('/production');
    };

    return (
        <div className="animate-slide-up">
            <Header title="Produksi Baru" showBack />

            <div className="p-4 max-w-md mx-auto">
                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[13px] transition-all ${step >= s ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25' : 'bg-slate-100 text-slate-400'
                                }`}>
                                {s}
                            </div>
                            {s < 3 && <div className={`w-8 h-[2px] rounded-full ${step > s ? 'bg-sky-500' : 'bg-slate-100'}`} />}
                        </div>
                    ))}
                </div>

                {/* Step 1: Select Product */}
                {step === 1 && (
                    <div className="space-y-3">
                        <p className="text-[13px] font-semibold text-slate-500 ml-0.5">Apa yang diproduksi?</p>
                        {products?.map(p => (
                            <button key={p.id} onClick={() => { setSelectedProductId(p.id!); setStep(2); }}
                                className="w-full p-4 rounded-2xl border text-left transition-all active:scale-[0.98] bg-white border-slate-100 shadow-sm hover:border-sky-200">
                                <p className="font-bold text-[15px] text-slate-800">{p.name}</p>
                                <p className="text-[12px] text-slate-400">{p.description}</p>
                            </button>
                        ))}
                    </div>
                )}

                {/* Step 2: Batch Weighing */}
                {step === 2 && product && (
                    <div className="space-y-4">
                        <div className="bg-sky-50 p-4 rounded-2xl flex items-center justify-between border border-sky-100">
                            <div>
                                <p className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">Memasak</p>
                                <p className="text-lg font-black text-sky-900">{product.name}</p>
                            </div>
                            <Scale className="w-7 h-7 text-sky-300" />
                        </div>

                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Timbang Bahan</p>

                        {recipe?.map(item => {
                            const ing = ingredients?.find(i => i.id === item.ingredientId);
                            return (
                                <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                                    <div className="flex justify-between items-center">
                                        <p className="font-bold text-[14px] text-slate-800">{ing?.name}</p>
                                        <span className="text-[10px] bg-slate-50 px-2 py-0.5 rounded-full font-bold text-slate-400 uppercase">{ing?.unit}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-semibold text-slate-400 uppercase ml-0.5">Sebelum</label>
                                            <input type="number" placeholder="0"
                                                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 text-[14px] font-bold"
                                                value={weights[item.ingredientId]?.before ?? ''}
                                                onChange={(e) => handleWeightChange(item.ingredientId, 'before', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-semibold text-slate-400 uppercase ml-0.5">Sesudah</label>
                                            <input type="number" placeholder="0"
                                                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 text-[14px] font-bold"
                                                value={weights[item.ingredientId]?.after ?? ''}
                                                onChange={(e) => handleWeightChange(item.ingredientId, 'after', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        <button onClick={() => setStep(3)}
                            className="w-full bg-sky-500 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-sky-500/20 text-[15px] active:scale-[0.98] transition-all">
                            Lanjut ke Hasil
                        </button>
                    </div>
                )}

                {/* Step 3: Results */}
                {step === 3 && product && (
                    <div className="space-y-5">
                        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 text-center">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                            <h2 className="text-lg font-black text-emerald-900">Produksi Selesai!</h2>
                            <p className="text-[13px] text-emerald-700 mt-1">Berapa total yang diproduksi?</p>
                            <div className="mt-4">
                                <input type="number" placeholder="0"
                                    className="w-28 text-center text-2xl font-black bg-white/60 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 text-emerald-900 py-2"
                                    value={totalProduced} onChange={(e) => setTotalProduced(e.target.value)} />
                                <p className="text-[11px] font-bold text-emerald-600 uppercase mt-1">Pcs</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
                            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rincian Biaya</h3>
                            {recipe?.map(item => {
                                const ing = ingredients?.find(i => i.id === item.ingredientId);
                                const w = weights[item.ingredientId] || { before: '0', after: '0' };
                                const beforeNum = w.before === '' ? 0 : Number(w.before);
                                const afterNum = w.after === '' ? 0 : Number(w.after);
                                const used = Math.max(0, beforeNum - afterNum);
                                const cost = used * (ing?.averagePricePerUnit || 0);
                                return (
                                    <div key={item.id} className="flex justify-between items-center text-[13px]">
                                        <span className="text-slate-600">{ing?.name}</span>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-800">Rp{Math.round(cost).toLocaleString('id-ID')}</p>
                                            <p className="text-[10px] text-slate-400">{used} {ing?.unit}</p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="pt-3 border-t border-slate-50 flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">HPP / Unit</p>
                                    <p className="text-xl font-black text-sky-600">Rp{Math.round(calculateHPP().hpp).toLocaleString('id-ID')}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Total</p>
                                    <p className="text-[14px] font-bold text-slate-700">Rp{Math.round(calculateHPP().totalCost).toLocaleString('id-ID')}</p>
                                </div>
                            </div>
                        </div>

                        <button onClick={handleFinish}
                            className="w-full bg-slate-800 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 text-[15px] active:scale-[0.98] transition-all">
                            Simpan Batch
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
