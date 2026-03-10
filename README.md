# 🍳 DapurLedger

**Pencatatan keuangan cerdas untuk UMKM makanan.**

DapurLedger adalah Progressive Web App (PWA) yang membantu pelaku usaha makanan rumahan mencatat biaya produksi, pemakaian bahan, penjualan, dan arus kas — langsung dari HP, tanpa perlu internet.

Semua data tersimpan **100% lokal** di browser (IndexedDB), sehingga aman, cepat, dan bisa dipakai sambil masak.

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|---|---|
| **Stok Bahan Baku** | Catat pembelian bahan, otomatis update stok dan harga rata-rata per gram/ml |
| **Manajemen Produk** | Buat produk dengan 3 tingkat harga (distributor, reseller, konsumen) |
| **Resep** | Hubungkan bahan ke produk dengan estimasi pemakaian per batch |
| **Produksi (Batch Weighing)** | Timbang bahan sebelum & sesudah masak → sistem hitung pemakaian & HPP otomatis |
| **Penjualan** | Catat transaksi per tipe pelanggan, estimasi laba otomatis |
| **Konsumsi Internal** | Catat produk yang dimakan sendiri/sample (tidak masuk revenue) |
| **Arus Kas** | Lihat saldo, pemasukan, dan pengeluaran dalam satu tampilan |
| **Biaya Operasional** | Catat pengeluaran non-bahan (gas, packaging, sewa, dll) |
| **Simulasi Produksi** | Masukkan target jumlah → sistem estimasi kebutuhan bahan |
| **Saran Harga Jual** | Atur margin profit → sistem sarankan harga jual per tingkat |
| **Peringatan Stok** | Notifikasi otomatis saat stok bahan di bawah minimum |

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Bahasa**: TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database Lokal**: [Dexie.js](https://dexie.org/) (IndexedDB wrapper)
- **Ikon**: [Lucide React](https://lucide.dev/)
- **PWA**: [@ducanh2912/next-pwa](https://github.com/AscensionGameDev/next-pwa)

---

## 🚀 Cara Menjalankan

```bash
# Pastikan berada di folder project
cd dapurledger-pwa

# Install dependencies
npm install

# Jalankan mode development
npm run dev
```

Buka `http://localhost:3000` di browser.

Untuk build production:
```bash
npm run build
npm start
```

---

## 📱 Instalasi di HP

1. Buka aplikasi di Chrome (Android) atau Safari (iOS)
2. Ketuk menu **⋮** → **"Add to Home Screen"** / **"Tambahkan ke Layar Utama"**
3. Aplikasi akan muncul seperti app native di HP

---

## 🗺️ Roadmap

- [x] Pencatatan pembelian bahan & stok otomatis
- [x] Produksi batch dengan metode timbang (batch weighing)
- [x] Perhitungan HPP otomatis
- [x] Pencatatan penjualan multi-tipe (distributor/reseller/eceran)
- [x] Arus kas & biaya operasional
- [x] Simulasi produksi & saran harga jual
- [ ] Export laporan ke PDF/Excel
- [ ] Grafik tren penjualan & produksi bulanan
- [ ] Backup & restore data (file JSON)
- [ ] Multi-produk dalam satu batch produksi
- [ ] Dark mode
- [ ] Bahasa Inggris (i18n)

---

## 📄 Lisensi

MIT License

---

<p align="center">
  Dibuat dengan ❤️ untuk pelaku UMKM makanan Indonesia
</p>
