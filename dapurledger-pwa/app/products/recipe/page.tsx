'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import Header from '@/components/Header';
import { Plus, Trash2, Save } from 'lucide-react';

function RecipeForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const productId = Number(searchParams.get('id'));

    const product = useLiveQuery(() => productId ? db.products.get(productId) : undefined, [productId]);
    const ingredients = useLiveQuery(() => db.ingredients.toArray());
    const recipeItems = useLiveQuery(() =>
        productId ? db.recipes.where('productId').equals(productId).toArray() : []
        , [productId]);

    const [selectedIngredientId, setSelectedIngredientId] = useState<string>('');
    const [estQty, setEstQty] = useState<string>('');

    const handleAddIngredient = async () => {
        if (!selectedIngredientId || !estQty || !productId) return;
        await db.recipes.add({
            productId,
            ingredientId: Number(selectedIngredientId),
            estimatedQty: Number(estQty),
        });
        setSelectedIngredientId('');
        setEstQty('');
    };

    const handleDeleteItem = async (id: number) => {
        await db.recipes.delete(id);
    };

    if (!product) return <div className="p-4 text-center text-slate-400">Produk tidak ditemukan.</div>;

    return (
        <div className="animate-slide-up">
            <Header title={`Resep: ${product.name}`} showBack />

            <div className="p-4 space-y-5 max-w-md mx-auto">
                {/* Add Ingredient */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Plus className="w-3 h-3" /> Tambah Komponen
                    </h3>

                    <select
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 text-[14px] font-medium text-slate-800"
                        value={selectedIngredientId}
                        onChange={(e) => setSelectedIngredientId(e.target.value)}
                    >
                        <option value="">Pilih Bahan...</option>
                        {ingredients?.map(ing => (
                            <option key={ing.id} value={ing.id}>{ing.name} ({ing.brand})</option>
                        ))}
                    </select>

                    <div className="flex gap-2">
                        <input type="number" placeholder="Estimasi Penggunaan"
                            className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 text-[14px] font-medium"
                            value={estQty} onChange={(e) => setEstQty(e.target.value)} />
                        <div className="bg-slate-100 px-3 py-3 rounded-xl text-slate-400 text-[13px] font-bold flex items-center">
                            {ingredients?.find(i => i.id === Number(selectedIngredientId))?.unit || 'unit'}
                        </div>
                    </div>

                    <button onClick={handleAddIngredient} disabled={!selectedIngredientId || !estQty}
                        className="w-full bg-sky-500 text-white py-2.5 rounded-xl font-bold active:scale-95 disabled:opacity-40 transition-all text-[14px]">
                        Tambah ke Resep
                    </button>
                </div>

                {/* Recipe List */}
                <div className="space-y-2">
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Daftar Bahan Resep</h3>

                    {(!recipeItems || recipeItems.length === 0) ? (
                        <div className="bg-white/50 rounded-2xl p-6 text-center border border-dashed border-slate-200">
                            <p className="text-slate-400 text-[13px]">Belum ada bahan dalam resep.</p>
                        </div>
                    ) : (
                        recipeItems.map((item) => {
                            const ing = ingredients?.find(i => i.id === item.ingredientId);
                            return (
                                <div key={item.id} className="bg-white p-3 px-4 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm">
                                    <div className="min-w-0">
                                        <p className="font-bold text-[14px] text-slate-800 truncate">{ing?.name || '...'}</p>
                                        <p className="text-[11px] text-slate-400 font-medium">{ing?.brand} · {item.estimatedQty} {ing?.unit}</p>
                                    </div>
                                    <button onClick={() => item.id && handleDeleteItem(item.id)}
                                        className="p-2 text-red-300 hover:text-red-500 shrink-0">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>

                <button onClick={() => router.push('/products')}
                    className="w-full bg-slate-800 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 text-[15px] active:scale-[0.98] transition-all">
                    <Save className="w-5 h-5" /> Selesai
                </button>
            </div>
        </div>
    );
}

export default function RecipePage() {
    return (
        <Suspense fallback={<div className="p-4 text-center text-slate-400">Memuat...</div>}>
            <RecipeForm />
        </Suspense>
    );
}
