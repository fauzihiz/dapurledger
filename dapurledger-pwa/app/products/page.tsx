'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import Header from '@/components/Header';
import { Plus, Tag, ChefHat } from 'lucide-react';
import Link from 'next/link';

export default function ProductsPage() {
    const products = useLiveQuery(() => db.products.toArray());

    return (
        <div className="animate-slide-up">
            <Header
                title="Produk & Resep"
                showBack
                action={
                    <Link href="/products/new" className="flex items-center gap-1 bg-sky-500 text-white pl-2.5 pr-3.5 py-1.5 rounded-full text-[13px] font-semibold active:scale-95 transition-transform">
                        <Plus className="w-4 h-4" /> Baru
                    </Link>
                }
            />

            <div className="p-4 space-y-3 max-w-md mx-auto">
                {!products || products.length === 0 ? (
                    <div className="bg-white rounded-2xl p-10 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 mt-4">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                            <ChefHat className="w-7 h-7 text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-semibold text-[15px]">Belum ada produk</p>
                        <p className="text-sm text-slate-400 mt-1">Buat produk dan atur resepnya.</p>
                    </div>
                ) : (
                    products.map((p) => (
                        <div key={p.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-start mb-3">
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-bold text-[15px] text-slate-800 truncate">{p.name}</h3>
                                    <p className="text-[12px] text-slate-400 truncate">{p.description}</p>
                                </div>
                                <Tag className="w-4 h-4 text-slate-200 shrink-0 ml-2" />
                            </div>

                            <div className="grid grid-cols-3 gap-2 py-3 border-t border-slate-50">
                                <div className="text-center">
                                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Distro</p>
                                    <p className="text-[13px] font-bold text-slate-700">Rp{p.distributorPrice.toLocaleString('id-ID')}</p>
                                </div>
                                <div className="text-center border-x border-slate-50">
                                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Resell</p>
                                    <p className="text-[13px] font-bold text-slate-700">Rp{p.resellerPrice.toLocaleString('id-ID')}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Retail</p>
                                    <p className="text-[13px] font-bold text-slate-700">Rp{p.customerPrice.toLocaleString('id-ID')}</p>
                                </div>
                            </div>

                            <Link
                                href={`/products/recipe?id=${p.id}`}
                                className="mt-2 block w-full bg-slate-50 text-sky-600 py-2.5 rounded-xl text-center text-[13px] font-bold active:bg-sky-50 transition-colors"
                            >
                                Kelola Resep
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
