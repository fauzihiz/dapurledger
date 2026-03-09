'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import Header from '@/components/Header';
import { Save } from 'lucide-react';

export default function NewProductPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        distributorPrice: 0,
        resellerPrice: 0,
        customerPrice: 0,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await db.products.add(formData);
        router.push('/products');
    };

    const inputClass = "w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-800 placeholder:text-slate-300";

    return (
        <div className="animate-slide-up">
            <Header title="Tambah Produk" showBack />

            <form onSubmit={handleSubmit} className="p-4 space-y-5 max-w-md mx-auto">
                <div className="space-y-4">
                    <div>
                        <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-0.5">Nama Produk</label>
                        <input required type="text" placeholder="Contoh: Risol Coklat" className={inputClass}
                            value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>

                    <div>
                        <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 ml-0.5">Deskripsi Ringkas</label>
                        <textarea placeholder="Contoh: Isian coklat lumer premium"
                            className={`${inputClass} min-h-[80px] resize-none`}
                            value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </div>

                    <div className="space-y-3 pt-2">
                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Atur Harga Jual</h3>
                        {[
                            { key: 'distributorPrice', label: 'Harga Distributor' },
                            { key: 'resellerPrice', label: 'Harga Reseller' },
                            { key: 'customerPrice', label: 'Harga Konsumen' },
                        ].map(({ key, label }) => (
                            <div key={key}>
                                <label className="block text-[12px] font-medium text-slate-500 mb-1 ml-0.5">{label}</label>
                                <input required type="number"
                                    className={`${inputClass} font-bold text-sky-600`}
                                    value={(formData as any)[key] || ''}
                                    onChange={(e) => setFormData({ ...formData, [key]: Number(e.target.value) })} />
                            </div>
                        ))}
                    </div>
                </div>

                <button type="submit"
                    className="w-full bg-sky-500 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all text-[15px]">
                    <Save className="w-5 h-5" /> Simpan Produk
                </button>
            </form>
        </div>
    );
}
