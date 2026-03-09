'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import Header from '@/components/Header';
import { Heart, Save } from 'lucide-react';

export default function InternalConsumptionPage() {
    const router = useRouter();
    const products = useLiveQuery(() => db.products.toArray());

    const [productId, setProductId] = useState<number | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [note, setNote] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productId) return;
        await db.consumption.add({ date: new Date(), productId, quantity, note });
        router.push('/');
    };

    return (
        <div className="animate-slide-up">
            <Header title="Konsumsi Internal" showBack />

            <form onSubmit={handleSubmit} className="p-4 space-y-5 max-w-md mx-auto">
                <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100 flex items-center gap-4">
                    <div className="bg-white p-2.5 rounded-xl shadow-sm">
                        <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                    </div>
                    <div>
                        <p className="font-bold text-[15px] text-rose-900">Konsumsi Sendiri</p>
                        <p className="text-[12px] text-rose-600 mt-0.5">Untuk akurasi stok, bukan revenue.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-0.5">Produk</label>
                        <select required
                            className="w-full px-4 py-3 rounded-xl bg-white border border-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 text-[14px] font-medium text-slate-800"
                            value={productId || ''} onChange={(e) => setProductId(Number(e.target.value))}>
                            <option value="">Pilih...</option>
                            {products?.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-0.5">Jumlah (Pcs)</label>
                        <input required type="number"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800 font-bold"
                            value={quantity || ''} onChange={(e) => setQuantity(Number(e.target.value))} />
                    </div>

                    <div>
                        <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-0.5">Catatan</label>
                        <textarea
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 text-[14px] font-medium min-h-[80px] resize-none placeholder:text-slate-300"
                            placeholder="Contoh: Dimakan keluarga"
                            value={note} onChange={(e) => setNote(e.target.value)} />
                    </div>
                </div>

                <button type="submit"
                    className="w-full bg-rose-500 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all text-[15px]">
                    <Save className="w-5 h-5" /> Simpan
                </button>
            </form>
        </div>
    );
}
