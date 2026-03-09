'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import Header from '@/components/Header';
import { Zap, Target, ArrowRight, Info } from 'lucide-react';

export default function SimulationPage() {
    const products = useLiveQuery(() => db.products.toArray());
    const ingredients = useLiveQuery(() => db.ingredients.toArray());
    const recipes = useLiveQuery(() => db.recipes.toArray());

    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [targetQty, setTargetQty] = useState<number>(0);
    const [profitMargin, setProfitMargin] = useState<number>(50);

    const productRecipe = recipes?.filter(r => r.productId === selectedProductId);

    const calculatedCost = productRecipe?.reduce((acc, item) => {
        const ing = ingredients?.find(i => i.id === item.ingredientId);
        return acc + (item.estimatedQty * (ing?.averagePricePerUnit || 0));
    }, 0) || 0;

    const totalCost = calculatedCost * targetQty;
    const hppPerUnit = calculatedCost;
    const suggestPrice = (margin: number) => hppPerUnit * (1 + margin / 100);

    return (
        <div className="animate-slide-up">
            <Header title="Simulasi & Harga" />

            <div className="p-4 space-y-5 max-w-md mx-auto pb-4">
                {/* Simulation */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-sky-500" /> Simulasi Produksi
                    </h3>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-[12px] font-medium text-slate-500 mb-1 ml-0.5">Produk Target</label>
                            <select
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 text-[14px] font-bold text-slate-800"
                                value={selectedProductId || ''} onChange={(e) => setSelectedProductId(Number(e.target.value))}>
                                <option value="">Pilih...</option>
                                {products?.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[12px] font-medium text-slate-500 mb-1 ml-0.5">Jumlah Rencana (Pcs)</label>
                            <input type="number" placeholder="0"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 text-lg font-black text-slate-800"
                                value={targetQty || ''} onChange={(e) => setTargetQty(Number(e.target.value))} />
                        </div>
                    </div>

                    {selectedProductId && targetQty > 0 && (
                        <div className="bg-sky-50 p-4 rounded-xl space-y-2 border border-sky-100">
                            <p className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">Estimasi Bahan</p>
                            {productRecipe?.map(item => {
                                const ing = ingredients?.find(i => i.id === item.ingredientId);
                                return (
                                    <div key={item.id} className="flex justify-between items-center text-[13px]">
                                        <span className="text-slate-600">{ing?.name}</span>
                                        <span className="font-bold text-sky-900">{(item.estimatedQty * targetQty).toLocaleString()} {ing?.unit}</span>
                                    </div>
                                );
                            })}
                            <div className="pt-2 border-t border-sky-100 flex justify-between">
                                <span className="text-[12px] font-semibold text-sky-700">Total Modal</span>
                                <span className="font-black text-sky-900">Rp{Math.round(totalCost).toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Price Suggestion */}
                {selectedProductId && (
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5 text-emerald-500" /> Saran Harga Jual
                        </h3>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-[12px] font-medium text-slate-500">Target Margin</label>
                                <span className="text-sky-600 font-black text-[14px]">{profitMargin}%</span>
                            </div>
                            <input type="range" min="10" max="300" step="5"
                                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-sky-500"
                                value={profitMargin} onChange={(e) => setProfitMargin(Number(e.target.value))} />
                        </div>

                        <div className="space-y-2">
                            {[
                                { label: 'Distributor (30%)', margin: 30, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-100' },
                                { label: 'Reseller (60%)', margin: 60, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                                { label: `Konsumen (${profitMargin}%)`, margin: profitMargin, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
                            ].map((s) => (
                                <div key={s.label} className={`${s.bg} p-3 rounded-xl flex justify-between items-center border ${s.border}`}>
                                    <p className="text-[12px] font-medium text-slate-600">{s.label}</p>
                                    <p className={`text-[16px] font-black ${s.color}`}>
                                        Rp{Math.round(suggestPrice(s.margin)).toLocaleString('id-ID')}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl">
                            <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                            <p className="text-[11px] text-slate-500 leading-normal">
                                Berdasarkan HPP <b>Rp{Math.round(hppPerUnit).toLocaleString('id-ID')}</b>/unit.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
