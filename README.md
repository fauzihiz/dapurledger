# 🍳 DapurLedger

**Pencatatan keuangan cerdas untuk UMKM makanan.**

DapurLedger adalah Progressive Web App (PWA) yang membantu pelaku usaha makanan rumahan mencatat biaya produksi, pemakaian bahan, penjualan, dan arus kas — langsung dari HP, tanpa perlu internet.

Semua data tersimpan **100% lokal** di browser (IndexedDB), sehingga aman, cepat, dan bisa dipakai sambil masak.

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|---|---|
| **Stok Bahan Baku** | Catat pembelian bahan, otomatis update stok dan harga rata-rata per gram/ml |
| **Produksi (Batch Weighing)** | Timbang bahan sebelum & sesudah masak → sistem hitung pemakaian & HPP otomatis |
| **Saran Harga Jual** | HPP digunakan untuk menyarankan harga jual ke distributor (+30%), reseller (+60%), dan eceran (+100%) |
| **Stok Barang Jadi** | Hasil produksi otomatis menambah stok produk, siap dicatat saat penjualan |
| **Penjualan** | Catat transaksi per tipe pelanggan, harga otomatis terisi, stok otomatis berkurang |
| **Arus Kas** | Setiap penjualan & pengeluaran tercatat ke saldo kas secara real-time |
| **Biaya Operasional** | Catat pengeluaran non-bahan (gas, packaging, sewa, dll) |
| **Riwayat Lengkap** | Riwayat batch produksi, penjualan, dan biaya operasional tersedia dan bisa dihapus |
| **Dashboard Finansial** | Lihat saldo kas, total penjualan, dan estimasi laba bersih dalam satu halaman |
| **Peringatan Stok** | Peringatan otomatis saat stok bahan di bawah batas minimum |

---

## 🔄 Alur Kerja

1. **Stok** — Input bahan baku yang dibeli (nama, merek, jumlah, harga).
2. **Produksi** — Mulai batch masak: pilih/buat produk, gunakan bahan dari stok, timbang.
3. **Hasil & HPP** — Masukkan jumlah pcs berhasil dibuat → sistem hitung HPP & saran harga.
4. **Jual** — Pilih produk, pilih tipe pembeli, harga sudah terisi otomatis.
5. **Pantau** — Dashboard menampilkan saldo, laba estimasi, dan stok bahan.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Bahasa**: TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database Lokal**: [Dexie.js](https://dexie.org/) (IndexedDB wrapper)
- **Ikon**: [Lucide React](https://lucide.dev/)
- **PWA**: [@ducanh2912/next-pwa](https://github.com/DuCanhGH/next-pwa)

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

### ✅ Sudah Selesai
- [x] Pencatatan pembelian bahan & stok otomatis
- [x] Produksi batch dengan metode timbang (batch weighing)
- [x] Perhitungan HPP & saran harga jual otomatis
- [x] Pencatatan penjualan multi-tipe (distributor/reseller/eceran)
- [x] Stok barang jadi otomatis dari hasil produksi
- [x] Arus kas & biaya operasional
- [x] Dashboard finansial (saldo, total penjualan, estimasi laba)
- [x] Hapus data (batch, bahan, produk, pengeluaran)
- [x] Riwayat penjualan & riwayat pengeluaran

### 🔜 Rencana Selanjutnya
- [ ] Export laporan ke PDF/Excel
- [ ] Grafik tren penjualan & produksi bulanan
- [ ] Backup & restore data (file JSON)
- [ ] Multi-produk dalam satu batch produksi
- [ ] Dark mode

---

## 📄 Lisensi

MIT License

---

<p align="center">
  Dibuat dengan ❤️ untuk pelaku UMKM makanan Indonesia
</p>
