'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import Header from '@/components/Header';
import {
  Package,
  AlertCircle,
  Wallet,
  ChefHat,
  Plus,
  History,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const ingredients = useLiveQuery(() => db.ingredients.toArray());
  const batches = useLiveQuery(() => db.batches.toArray());
  const cashflow = useLiveQuery(() => db.cashflow.toArray());

  const lowStockItems = ingredients?.filter(ing => (ing.minStock ?? 0) > 0 && ing.currentStock <= ing.minStock) || [];

  const totalCash = cashflow?.reduce((acc, item) =>
    item.type === 'in' ? acc + item.amount : acc - item.amount, 0) || 0;

  const totalBatches = batches?.length || 0;
  const latestBatch = batches?.[0];
  const lastHpp = latestBatch?.hpp || 0;

  return (
    <div className="animate-slide-up">
      <Header title="DapurLedger" />

      <div className="p-4 space-y-5 max-w-md mx-auto">
        {/* Hero Balance */}
        <div className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-[1.5rem] p-5 text-white shadow-xl shadow-sky-500/20 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sky-100 text-[11px] font-semibold uppercase tracking-wider">Saldo Kas</p>
            <h2 className="text-[28px] font-black mt-0.5 tracking-tight">
              Rp{totalCash.toLocaleString('id-ID')}
            </h2>

            <div className="flex gap-6 mt-4 pt-4 border-t border-white/20">
              <div>
                <p className="text-sky-100 text-[10px] font-semibold uppercase">Total Batch</p>
                <p className="text-sm font-bold">{totalBatches}</p>
              </div>
              <div>
                <p className="text-sky-100 text-[10px] font-semibold uppercase">HPP Terakhir</p>
                <p className="text-sm font-bold">Rp{Math.round(lastHpp).toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>
          <Wallet className="absolute -bottom-4 -right-3 w-28 h-28 text-sky-400/20 rotate-12" />
        </div>

        {/* Quick Action Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/inventory/purchase" className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3 active:scale-[0.97] transition-transform">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Package className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="font-bold text-[15px] text-slate-800 leading-tight">Beli Bahan</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Input belanjaan</p>
            </div>
          </Link>

          <Link href="/inventory" className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3 active:scale-[0.97] transition-transform">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Package className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="font-bold text-[15px] text-slate-800 leading-tight">Cek Stok</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Lihat sisa bahan</p>
            </div>
          </Link>

          <Link href="/production/new" className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3 active:scale-[0.97] transition-transform">
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-sky-500" />
            </div>
            <div>
              <p className="font-bold text-[15px] text-slate-800 leading-tight">Produksi Baru</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Mulai masak</p>
            </div>
          </Link>

          <Link href="/production" className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3 active:scale-[0.97] transition-transform">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <History className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <p className="font-bold text-[15px] text-slate-800 leading-tight">Riwayat</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Data produksi</p>
            </div>
          </Link>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <h3 className="text-xs font-bold text-red-600 uppercase tracking-wider">Stok Rendah</h3>
            </div>
            <div className="space-y-2">
              {lowStockItems.slice(0, 3).map(ing => (
                <div key={ing.id} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-red-800">{ing.name}</span>
                  <span className="text-xs font-bold text-red-500">{ing.currentStock} {ing.unit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-slate-400 font-semibold text-[10px] uppercase tracking-widest mb-1.5">Tips</h3>
            <p className="text-[15px] font-semibold leading-snug">Pantau HPP setiap batch untuk profit maksimal! 📊</p>
          </div>
          <TrendingUp className="absolute -bottom-3 -right-3 w-24 h-24 text-slate-700/40" />
        </div>
      </div>
    </div>
  );
}
