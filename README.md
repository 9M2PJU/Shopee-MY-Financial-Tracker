# Shopee MY Financial Tracker

<p align="center">
  <img src="images/logo1.png" width="320" alt="Shopee MY Financial Tracker">
</p>

<p align="center">
  <b>A lightweight, powerful browser userscript to track, calculate, and analyze your Shopee Malaysia purchases with comprehensive financial reporting (MYR).</b>
</p>

<p align="center">
  <a href="#panduan-bahasa-melayu">🇲🇾 Baca Panduan dalam Bahasa Melayu</a> •
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#ui-controls">UI Controls</a>
</p>

---

## Features

- 📊 **Comprehensive Financial Tracking (MYR)**
  - Track Original Price and Discount Price in Malaysian Ringgit (`RM`)
  - Track Order Date and Time
  - Track Item Quantity and Name
  - Automatically calculate Item Subtotals and Grand Total

- 🎨 **Modern & Interactive UI/UX**
  - Clean, responsive floating panel
  - Dark Mode & Light Mode support
  - Draggable header and resizable window
  - Real-time progress bar with delay countdown
  - Search and multi-column filtering

- 📈 **Advanced Export Options**
  - **CSV Export**: Clean spreadsheet export formatted for Microsoft Excel & Google Sheets (semicolon delimited with proper Ringgit decimals)
  - **Markdown Export**: Formatted markdown tables for note-taking and documentation

- 🔄 **Smart Automation**
  - One-click automatic order link extraction from "My Purchases"
  - Smart duplicate link detection and cleanup
  - Anti-bot delay rate-limiting to prevent rate limits
  - Graceful CAPTCHA detection and auto-resume

---

## Screenshots

| Main Interface | Order Processing | Export Results |
|:---:|:---:|:---:|
| ![UI](images/UI.png) | ![Script in action](images/detail.png) | ![Export](images/export.png) |

---

## Installation

### 1. Install a Userscript Manager
Choose and install a userscript extension for your web browser:
- [Tampermonkey](https://www.tampermonkey.net/) (Recommended)
- [Violentmonkey](https://violentmonkey.github.io/)
- [Greasemonkey](https://www.greasespot.net/)

### 2. Install the Script
- **Direct Install:** Click [Install SFT.js](https://raw.githubusercontent.com/9M2PJU/Shopee-MY-Financial-Tracker/main/SFT.js)
- Or copy the content of [`SFT.js`](SFT.js) into a new script in your Tampermonkey dashboard.

---

## Usage

1. **Enable Popups for Shopee Malaysia (`shopee.com.my`)**
   - **Google Chrome / Brave / Edge:** Click the 🔒 / 🎛️ icon beside the URL bar > **Site settings** > Set **Pop-ups and redirects** to **Allow**.
   - **Mozilla Firefox:** Click ⓘ > **Permissions** > Allow Popups.

2. **Extract Order Links**
   - Go to Shopee Malaysia: [shopee.com.my/user/purchase](https://shopee.com.my/user/purchase)
   - Click on the **Completed** tab.
   - Scroll down to load the orders you want to track.
   - Click **[🔗 Extract Order Links]** to automatically pull order links into the input box.

3. **Clean Up Duplicates**
   - Click **[🔍 Remove Duplicates]** to ensure no repeated orders exist in the list.

4. **Start Extraction**
   - Click **[▶️ Start]** to begin parsing order details.
   - The script will open and read order pages with safe delays.

5. **Export Your Report**
   - Click **[📊 Export CSV]** for Excel / Google Sheets.
   - Click **[📝 Export Markdown]** for Markdown-compatible notes (Notion, Obsidian, GitHub).

---

## UI Controls

- **`Ctrl + M`**: Show / hide the tracker interface at any time.
- **☀️ / 🌙**: Toggle between Light Mode and Dark Mode.
- **Header Drag**: Click and drag the header to move the window.
- **Resize Handle**: Drag the bottom-right corner to resize the window.

---

<a name="panduan-bahasa-melayu"></a>
# Panduan Bahasa Melayu

## Penjejak Kewangan Shopee Malaysia (SFT-MY)

Skrip pelayar web (userscript) yang pantas dan komprehensif untuk menjejak, mengira dan menganalisis sejarah pembelian anda di **Shopee Malaysia** dalam mata wang Ringgit Malaysia (`RM`).

### Ciri-ciri Utama

- 📊 **Pelaporan Kewangan Lengkap (RM)**
  - Menjejak Harga Asal dan Harga Diskaun dalam Ringgit Malaysia
  - Menjejak Tarikh Pesanan dan Masa Pembelian
  - Mengira Kuantiti Barangan, Jumlah Setiap Item dan Jumlah Keseluruhan (*Grand Total*)
- 🎨 **Antaramuka Moden & Interaktif**
  - Sokongan Mod Gelap (*Dark Mode*) & Mod Terang (*Light Mode*)
  - Tetingkap boleh digerakkan (seret) dan diubah saiz
  - Bar status kemajuan masa nyata (*real-time*)
  - Carian pantas dan penapisan data (*filters*)
- 📈 **Pilihan Eksport Data**
  - **Eksport CSV**: Dioptimumkan untuk Microsoft Excel dan Google Sheets
  - **Eksport Markdown**: Format jadual markdown untuk dokumentasi
- 🔄 **Fungsi Pintar**
  - Pengekstrakan pautan pesanan secara automatik
  - Pengesanan dan pembersihan pautan pendua (*duplicates*)
  - Kawalan jeda pintar untuk mengelakkan sekatan keselamatan Shopee

---

### Cara Pemasangan

1. **Pasang Pengurus Userscript pada Pelayar Anda:**
   - [Tampermonkey](https://www.tampermonkey.net/) (Disyorkan)
   - [Violentmonkey](https://violentmonkey.github.io/)
   - [Greasemonkey](https://www.greasespot.net/)

2. **Pasang Skrip SFT-MY:**
   - Klik [Pasang SFT.js](https://raw.githubusercontent.com/9M2PJU/Shopee-MY-Financial-Tracker/main/SFT.js) atau salin kod dari fail [`SFT.js`](SFT.js) ke dalam Tampermonkey.

---

### Langkah Penggunaan

1. **Benarkan Tetingkap Timbul (*Popups*):**
   - Pada laman `shopee.com.my`, buka tetapan kebenaran pelayar web anda dan tetapkan **Pop-ups and redirects** kepada **Benarkan / Allow**.

2. **Ekstrak Pautan Pesanan:**
   - Pergi ke halaman **Pesanan Saya** (*My Purchases*): [shopee.com.my/user/purchase](https://shopee.com.my/user/purchase)
   - Pilih tab **Selesai** (*Completed*).
   - Skrol ke bawah sehingga senarai pesanan yang ingin dijejak dimuatkan.
   - Klik **[🔗 Extract Order Links]** untuk mengekstrak pautan pesanan yang dipaparkan.

3. **Padam Pautan Pendua:**
   - Klik **[🔍 Remove Duplicates]** untuk membuang pautan yang berulang.

4. **Mulakan Proses:**
   - Klik butang **[▶️ Start]** untuk memulakan penjejakan pesanan.
   - Skrip akan membaca setiap pesanan secara automatik dengan selang masa yang selamat.

5. **Eksport Laporan:**
   - Klik **[📊 Export CSV]** untuk membuka dalam Excel atau Google Sheets.
   - Klik **[📝 Export Markdown]** untuk salinan teks berformat.

---

### Kawalan Antaramuka (UI)

- **`Ctrl + M`**: Papar / sembunyikan tetingkap alat pada bila-bila masa.
- **☀️ / 🌙**: Tukar antara mod gelap dan mod terang.
- **Seret Pengepala**: Klik dan tahan bahagian atas tetingkap untuk mengalih kedudukan.
- **Ubah Saiz**: Tarik penjuru kanan bawah untuk membesarkan atau mengecilkan tetingkap.

---

## Penafian / Disclaimer

Projek ini tidak berafiliasi dengan Shopee Mobile Malaysia Sdn. Bhd., Shopee Pte. Ltd., atau mana-mana anak syarikatnya. Skrip ini dibangunkan untuk tujuan pengurusan dan pelaporan kewangan peribadi. Shopee dan logonya adalah tanda dagangan milik Shopee Pte. Ltd. Gunakan atas risiko sendiri.

---

## Kredit / Credits

- Diadaptasi untuk Shopee Malaysia oleh [9M2PJU](https://github.com/9M2PJU)
- Projek asal dibangunkan oleh [Ryu-Sena](https://github.com/tukangcode) | Komuniti IndoTech & penambahbaikan UI oleh [pataanggs](https://github.com/pataanggs)

---

## Lesen / License

Dilesenkan di bawah [Lesen MIT](LICENSE).
