# Bluetooth Thermal Receipt Printer 🖨️🧾

Aplikasi web modern berbasis **Next.js 14**, **React 18**, **TypeScript**, dan **Tailwind CSS** yang memanfaatkan **Web Bluetooth API** untuk menghubungkan browser secara langsung ke printer thermal Bluetooth (ESC/POS) tanpa memerlukan aplikasi atau driver pihak ketiga.

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Web Bluetooth](https://img.shields.io/badge/Web_Bluetooth-API-0082FC?style=for-the-badge&logo=bluetooth)

---

## ✨ Fitur Utama

- 📶 **Web Bluetooth Direct Pairing**: Melakukan pemindaian dan koneksi BLE GATT langsung dari peramban ke printer thermal Bluetooth (58mm / 80mm).
- 📜 **ESC/POS Command Encoder**:
  - Format teks otomatis (Bold, Center Align, Left/Right Align, Double Height/Width).
  - Garis pemisah, header toko, rincian produk, subtotal, pajak, dan footer ucapan terima kasih.
  - Perintah *Paper Cut* dan *Feed Line* standar ESC/POS.
- 📱 **Desain Responsif & User-Friendly**:
  - Pratinjau struk kasir (*receipt preview*) secara langsung di layar sebelum dicetak.
  - Form input dinamis untuk item belanja, harga, kuantitas, dan diskon.
  - Status koneksi printer real-time (Disconnected, Connecting, Connected, Printing).

---

## 🛠️ Persyaratan Sistem & Browser

Web Bluetooth API didukung oleh peramban berbasis Chromium:
- ✅ **Google Chrome** (Desktop Windows, Mac, Linux, Chrome for Android)
- ✅ **Microsoft Edge** (Windows, Mac)
- ✅ **Opera** (Desktop & Android)
- ⚠️ *Catatan: Fitur Bluetooth memerlukan konteks aman (`https://` atau `localhost`).*

---

## 🚀 Panduan Memulai

### 1. Kloning Repositori
```bash
git clone https://github.com/josapratama/bluetooth-receipt-printer.git
cd bluetooth-receipt-printer
```

### 2. Instalasi Dependensi
```bash
bun install
# atau
npm install
```

### 3. Menjalankan Server Development
```bash
bun run dev
# atau
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Chrome atau Edge.

### 4. Build untuk Produksi
```bash
bun run build
bun run start
```

---

## 📁 Struktur Proyek

```
bluetooth-receipt-printer/
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout & font Geist
│   │   └── page.tsx           # Halaman utama aplikasi kasir & printer
│   ├── bluetooth/
│   │   └── bluetoothTypes.ts  # Interface & tipe data Web Bluetooth API
│   ├── components/
│   │   ├── BluetoothPrinter.tsx # Komponen tombol koneksi & cetak struk
│   │   └── BluetoothPrinter.module.css
│   └── utils/
│       ├── bluetoothUtils.ts  # Helper koneksi GATT & penulisan buffer data
│       └── receiptUtils.ts    # Generator ESC/POS byte array struk belanja
├── package.json
└── tailwind.config.ts
```

---

## 📄 Lisensi

Didistribusikan di bawah lisensi MIT. Dibuat oleh [@josapratama](https://github.com/josapratama).
