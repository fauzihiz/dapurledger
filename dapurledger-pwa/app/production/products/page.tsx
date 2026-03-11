'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import Header from '@/components/Header';
import { Package, Trash2, ChevronLeft, Plus, Info } from 'lucide-react';
import Link from 'next/link';

export default function ProductListPage() {
    const products = useLiveQuery(() => db.products.toArray());

    const handleDeleteProduct = async (id: number) => {
        if (!confirm('Hapus produk ini? Riwayat produksi dan penjualan untuk produk ini akan ikut terhapus.')) return;

        await db.transaction('rw', [db.products, db.batches, db.sales, db.recipes], async () => {
            await db.batches.where('productId').equals(id).delete();
            await db.sales.where('productId').equals(id).delete();
            await db.recipes.where('productId').equals(id).delete();
            await db.products.delete(id);
        });
    };

    return (
        <div className="animate-slide-up pb-20">
            <Header title="Daftar Produk" showBack />

            <div className="p-4 space-y-4 max-w-md mx-auto">
                <div className="bg-sky-50 p-4 rounded-2xl border border-sky-100 flex gap-3 items-start">
                    <Info className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-sky-700 font-medium leading-relaxed">
                        Produk otomatis ditambahkan saat Anda membuat batch produksi baru. Di sini Anda bisa menghapus produk yang sudah tidak dijual lagi.
                    </p>
                </div>

                {!products || products.length === 0 ? (
                    <div className="bg-white rounded-[2rem] p-12 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 mt-4">
                        <Package className="w-12 h-12 text-slate-200 mb-4" />
                        <p className="text-slate-500 font-black">Belum ada produk</p>
                        <p className="text-xs text-slate-400 mt-2">Masak baru di menu Produksi untuk menambah produk otomatis.</p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {products.map((p) => (
                            <div key={p.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-sky-50 group-hover:text-sky-500 transition-colors">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-800 leading-none">{p.name}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Sisa Stok: {p.currentStock || 0} PCS</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteProduct(p.id!)}
                                    className="p-2 text-slate-300 hover:text-red-500 active:scale-90 transition-all"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="pt-4 flex gap-3">
                    <Link href="/production/new" className="flex-1 bg-slate-800 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95 transition-all">
                        <Plus className="w-4 h-4" /> PRODUKSI BARU
                    </Link>
                </div>
            </div>
        </div>
    );
}
