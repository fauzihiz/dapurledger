'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import Header from '@/components/Header';
import {
  Plus,
  History,
  TrendingUp,
  ShoppingBag,
  ChefHat,
  ChevronRight,
  Wallet,
  Package
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const ingredients = useLiveQuery(() => db.ingredients.toArray());
  const batches = useLiveQuery(() => db.batches.toArray());
  const cashflow = useLiveQuery(() => db.cashflow.toArray());
  const sales = useLiveQuery(() => db.sales.toArray());

  const lowStockItems = ingredients?.filter(ing => (ing.minStock ?? 0) > 0 && ing.currentStock <= ing.minStock) || [];

  const totalCash = cashflow?.reduce((acc, item) =>
    item.type === 'in' ? acc + item.amount : acc - item.amount, 0) || 0;

  const totalSalesVolume = sales?.reduce((acc, s) => acc + s.totalRevenue, 0) || 0;
  const totalEstimatedProfit = sales?.reduce((acc, s) => acc + s.estimatedProfit, 0) || 0;

  const totalBatches = batches?.length || 0;
  const latestBatch = batches?.[0];
  const lastHpp = latestBatch?.hpp || 0;

  return (
    <div className="animate-slide-up">
      <Header title="DapurLedger" />

      <div className="p-4 space-y-5 max-w-md mx-auto">
        {/* Hero Balance */}
        <div className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-[2rem] p-6 text-white shadow-xl shadow-sky-500/20 relative overflow-hidden">
          <div className="relative z-10 text-center">
            <p className="text-sky-100 text-[11px] font-black uppercase tracking-[0.2em] mb-1">Saldo Kas Saat Ini</p>
            <h2 className="text-4xl font-black tracking-tight">
              Rp{totalCash.toLocaleString('id-ID')}
            </h2>

            <div className="flex gap-1 mt-6 bg-white/10 p-1 rounded-2xl">
              <div className="flex-1 py-3 px-2 border-r border-white/10">
                <p className="text-sky-100 text-[9px] font-black uppercase tracking-widest">Total Batch</p>
                <p className="text-sm font-black">{totalBatches}</p>
              </div>
              <div className="flex-1 py-3 px-2">
                <p className="text-sky-100 text-[9px] font-black uppercase tracking-widest">HPP Terakhir</p>
                <p className="text-sm font-black">Rp{Math.round(lastHpp).toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>
          <Wallet className="absolute -bottom-6 -right-6 w-32 h-32 text-sky-400/20 rotate-12" />
        </div>

        {/* Financial Summary */}
        <Link href="/sales" className="block bg-white p-5 rounded-3xl border border-slate-100 shadow-sm active:scale-[0.98] transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none">Total Penjualan</p>
              <p className="text-lg font-black text-slate-800 mt-1">Rp{totalSalesVolume.toLocaleString('id-ID')}</p>
            </div>
            <div className="w-[1px] h-8 bg-slate-100" />
            <div className="text-right">
              <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest leading-none">Estimasi Laba</p>
              <p className="text-lg font-black text-emerald-600 mt-1">+Rp{totalEstimatedProfit.toLocaleString('id-ID')}</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-50 flex justify-center items-center gap-1.5 text-[10px] font-black text-sky-500 hover:text-sky-600 uppercase tracking-widest">
            RIWAYAT JUAL <ChevronRight className="w-3 h-3" />
          </div>
        </Link>

        {/* Quick Action Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/inventory/purchase" className="bg-white p-5 rounded-[1.75rem] border border-slate-100 shadow-sm flex flex-col gap-4 active:scale-[0.97] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
              <Package className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="font-black text-[15px] text-slate-800 leading-tight">Beli Bahan</p>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Stok & Kas</p>
            </div>
          </Link>

          <Link href="/production/new" className="bg-white p-5 rounded-[1.75rem] border border-slate-100 shadow-sm flex flex-col gap-4 active:scale-[0.97] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-sky-500" />
            </div>
            <div>
              <p className="font-black text-[15px] text-slate-800 leading-tight">Produksi</p>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Masak Baru</p>
            </div>
          </Link>

          <Link href="/sales/new" className="bg-slate-800 p-5 rounded-[1.75rem] shadow-lg shadow-slate-900/10 flex flex-col gap-4 active:scale-[0.97] transition-all border border-slate-700">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <p className="font-black text-[15px] text-white leading-tight">Jual</p>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">Catat Cuan</p>
            </div>
          </Link>

          <Link href="/expenses" className="bg-white p-5 rounded-[1.75rem] border border-slate-100 shadow-sm flex flex-col gap-4 active:scale-[0.97] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-red-400 rotate-180" />
            </div>
            <div>
              <p className="font-black text-[15px] text-slate-800 leading-tight">Riwayat Biaya</p>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Catatan</p>
            </div>
          </Link>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <div className="bg-red-50 border border-red-100 rounded-[1.75rem] p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <h3 className="text-[10px] font-black text-red-600 uppercase tracking-widest">Stok Hampir Habis</h3>
            </div>
            <div className="space-y-2.5">
              {lowStockItems.slice(0, 3).map(ing => (
                <div key={ing.id} className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border border-red-100">
                  <span className="text-[13px] font-black text-slate-800 leading-none">{ing.name}</span>
                  <span className="text-[11px] font-black text-red-500">{ing.currentStock} {ing.unit}</span>
                </div>
              ))}
              <Link href="/inventory" className="block text-center text-[11px] font-black text-red-400 hover:text-red-600 mt-2 uppercase tracking-widest">Lihat Semua Stok →</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
