# Shopee MY Financial Tracker

<p align="center">
  <img src="images/logo1.png" width="320" alt="Shopee MY Financial Tracker Logo">
</p>

<p align="center">
  <b>A lightweight, powerful browser userscript to track, calculate, and analyze your Shopee Malaysia purchases with comprehensive financial reporting in Malaysian Ringgit (MYR).</b>
</p>

<p align="center">
  <a href="https://github.com/9M2PJU/Shopee-MY-Financial-Tracker/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <a href="https://www.tampermonkey.net/"><img src="https://img.shields.io/badge/Userscript-Tampermonkey-orange.svg" alt="Userscript"></a>
  <a href="https://shopee.com.my"><img src="https://img.shields.io/badge/Platform-Shopee%20Malaysia%20(MYR)-ee4d2d.svg" alt="Shopee Malaysia"></a>
  <a href="SFT.js"><img src="https://img.shields.io/badge/Version-2.1-blue.svg" alt="Version 2.1"></a>
</p>

<p align="center">
  <a href="https://raw.githubusercontent.com/9M2PJU/Shopee-MY-Financial-Tracker/main/SFT.user.js">
    <img src="https://img.shields.io/badge/⚡_Direct_Install-SFT.user.js-success?style=for-the-badge&logo=tampermonkey" alt="Install SFT.user.js">
  </a>
</p>

<p align="center">
  <a href="#panduan-bahasa-melayu">🇲🇾 Baca Panduan dalam Bahasa Melayu</a> •
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage-guide">Usage Guide</a> •
  <a href="#ui-controls">UI Controls</a> •
  <a href="#troubleshooting--tips">Troubleshooting</a>
</p>

---

## Features

- 📊 **Comprehensive Financial Tracking (MYR)**
  - Tracks **Original Price** and **Discounted Price** in Malaysian Ringgit (`RM`).
  - Records **Order Date & Time**, **Shop Name**, **Item Titles**, and **Quantities**.
  - Automatically calculates item totals and cumulative **Grand Total**.

- 🎨 **Modern & Interactive UI/UX**
  - Clean, responsive floating panel with draggable header and resizable borders.
  - Full **Dark Mode** & **Light Mode** support (preference saved across sessions).
  - Real-time progress bar with live countdown timer during rate-limit delays.
  - Interactive search bar and multi-column filtering engine.

- 📈 **Advanced Export Options**
  - **CSV Export**: Clean spreadsheet export formatted for Microsoft Excel & Google Sheets with proper Ringgit decimal places.
  - **Markdown Export**: Formatted markdown tables suitable for Obsidian, Notion, GitHub notes, or personal documentation.

- 🔄 **Smart Automation & Protection**
  - **One-Click Link Extraction**: Automatically extracts order links directly from your Shopee "My Purchases" page.
  - **Duplicate Cleaner**: Easily eliminates duplicate order URLs.
  - **Rate-Limit Safe**: Built-in safe delay mechanism between requests to avoid trigger limits.
  - **Anti-CAPTCHA Handling**: Automatically pauses to allow manual CAPTCHA solving, then seamlessly resumes.

---

## Screenshots

| Main Interface | Order Scraping in Action | Financial Export |
|:---:|:---:|:---:|
| ![UI](images/UI.png) | ![Script in action](images/detail.png) | ![Export](images/export.png) |

---

## Installation

### Step 1: Install a Userscript Manager
Install one of the following recommended browser extensions:
- [Tampermonkey](https://www.tampermonkey.net/) *(Highly Recommended)*
- [Violentmonkey](https://violentmonkey.github.io/)
- [Greasemonkey](https://www.greasespot.net/)

### Step 2: Install Shopee MY Financial Tracker
- **One-Click Install:** Click 👉 [**Install SFT.user.js**](https://raw.githubusercontent.com/9M2PJU/Shopee-MY-Financial-Tracker/main/SFT.user.js)
- *Alternative:* Open your Tampermonkey dashboard, create a new userscript, and paste the code from [`SFT.user.js`](SFT.user.js).

---

## Usage Guide

1. **Allow Popups on Shopee Malaysia (`shopee.com.my`)**
   - **Google Chrome / Brave / Edge:** Click the 🔒 / 🎛️ icon next to the address bar > **Site settings** > Set **Pop-ups and redirects** to **Allow**.
   - **Mozilla Firefox:** Click ⓘ > **Permissions** > Check **Allow Popups**.

2. **Extract Order Links**
   - Navigate to the Shopee Purchases page: [shopee.com.my/user/purchase](https://shopee.com.my/user/purchase)
   - Select the **Completed** tab.
   - Scroll down to load the order history you wish to track.
   - Click **[🔗 Extract Order Links]** in the tracker panel to pull all visible order links into the input box.

3. **Remove Duplicates**
   - Click **[🔍 Remove Duplicates]** to clean up any redundant links.

4. **Start Extraction**
   - Click **[▶️ Start]** to begin extracting item details and financial figures.
   - The script opens each order safely in the background with configured delays.

5. **Export Your Report**
   - Click **[📊 Export CSV]** for Excel / Google Sheets analysis.
   - Click **[📝 Export Markdown]** for markdown documentation.

---

## UI Controls

| Control | Action |
|:---|:---|
| **`Ctrl + M`** | Toggle tracker UI visibility (Show / Hide) |
| **🌙 / ☀️** | Toggle between Dark Mode and Light Mode |
| **Header Drag** | Click and hold the header bar to move the window anywhere |
| **Bottom-Right Handle** | Click and drag the corner to resize the window |
| **Column Headers** | Click any table column header to sort ascending / descending |

---

## Troubleshooting & Tips

- **Tab Activity:** Keep the Shopee tab open and active during parsing. Avoid minimizing the window so that browser timers run at full speed.
- **Device Sleep:** Play background music or keep your display on to prevent your computer from sleeping during large batch jobs.
- **CAPTCHA Prompt:** If a security CAPTCHA is displayed, solve it manually; the script will resume processing automatically after solving.
- **Excel Semicolon Delimiter:** CSV exports use semicolons (`;`) for optimal compatibility with international Excel number formatting.

---

<a name="panduan-bahasa-melayu"></a>
# Panduan Bahasa Melayu

## Penjejak Kewangan Shopee Malaysia (SFT-MY)

Skrip pelayar web (*userscript*) yang pantas, mudah dan komprehensif untuk menjejak, mengira dan menganalisis perbelanjaan pembelian anda di **Shopee Malaysia** dalam mata wang Ringgit Malaysia (`RM`).

---

### Ciri-ciri Utama

- 📊 **Pelaporan Kewangan Lengkap (RM)**
  - Menjejak **Harga Asal** dan **Harga Diskaun** dalam Ringgit Malaysia (`RM`).
  - Merekodkan **Tarikh Pesanan & Masa**, **Nama Kedai**, **Nama Produk**, dan **Kuantiti**.
  - Mengira jumlah setiap barangan dan **Jumlah Keseluruhan (*Grand Total*)** secara automatik.

- 🎨 **Antaramuka Moden & Interaktif**
  - Panel terapung yang kemas, boleh digerakkan (*drag & drop*) dan diubah saiz mengikut keselesaan.
  - Sokongan penuh **Mod Gelap (*Dark Mode*)** dan **Mod Terang (*Light Mode*)**.
  - Bar status kemajuan masa nyata (*real-time progress bar*) beserta pemasa undur jeda.
  - Carian pantas dan enjin penapisan mengikut pelbagai lajur.

- 📈 **Pilihan Eksport Data Lanjutan**
  - **Eksport CSV**: Format spreadsheet yang dioptimumkan untuk Microsoft Excel & Google Sheets dengan format sen Ringgit yang tepat.
  - **Eksport Markdown**: Format jadual markdown untuk dokumentasi (Notion, Obsidian, GitHub).

- 🔄 **Automasi Pintar & Keselamatan**
  - **Pengekstrakan Pautan Pantas**: Mengambil pautan pesanan secara automatik daripada halaman *Pesanan Saya*.
  - **Pembersihan Pendua**: Memadamkan pautan pesanan yang berulang dengan satu klik.
  - **Kawalan Jeda Selamat**: Selang masa automatik bagi mengelakkan sekatan keselamatan Shopee.
  - **Pengendalian CAPTCHA**: Skrip menjeda secara automatik untuk membolehkan penyelesaian CAPTCHA manual sebelum menyambung semula.

---

### Cara Pemasangan

#### Langkah 1: Pasang Pengurus Userscript
Pasang salah satu sambungan pelayar web berikut:
- [Tampermonkey](https://www.tampermonkey.net/) *(Sangat Disyorkan)*
- [Violentmonkey](https://violentmonkey.github.io/)
- [Greasemonkey](https://www.greasespot.net/)

#### Langkah 2: Pasang Skrip SFT-MY
- **Pemasangan Terus:** Klik 👉 [**Pasang SFT.user.js**](https://raw.githubusercontent.com/9M2PJU/Shopee-MY-Financial-Tracker/main/SFT.user.js)
- *Pilihan Alternatif:* Buka papan pemuka (*dashboard*) Tampermonkey anda, cipta skrip baharu dan salin keseluruhan kod daripada fail [`SFT.user.js`](SFT.user.js).

---

### Langkah Penggunaan

1. **Benarkan Tetingkap Timbul (*Popups*) di Shopee Malaysia:**
   - **Google Chrome / Brave / Edge:** Klik ikon 🔒 / 🎛️ bersebelahan palang alamat > **Site settings** > Tetapkan **Pop-ups and redirects** kepada **Allow (Benarkan)**.
   - **Mozilla Firefox:** Klik ⓘ > **Permissions** > Tandakan **Allow Popups**.

2. **Ekstrak Pautan Pesanan:**
   - Buka halaman Pesanan Saya: [shopee.com.my/user/purchase](https://shopee.com.my/user/purchase)
   - Klik pada tab **Selesai (*Completed*)**.
   - Skrol ke bawah sehingga senarai pesanan yang ingin dijejak dimuatkan sepenuhnya pada skrin.
   - Klik butang **[🔗 Extract Order Links]** pada panel penjejak untuk memasukkan semua pautan pesanan.

3. **Padam Pautan Berulang (*Duplicates*):**
   - Klik **[🔍 Remove Duplicates]** untuk membuang sebarang pautan pendua.

4. **Mulakan Ekstraksi:**
   - Klik butang **[▶️ Start]** untuk memulakan proses membaca perincian kewangan pesanan.
   - Skrip akan memproses setiap pesanan satu demi satu secara automatik dengan selang masa yang selamat.

5. **Eksport Laporan Kewangan:**
   - Klik **[📊 Export CSV]** untuk analisis dalam Excel atau Google Sheets.
   - Klik **[📝 Export Markdown]** untuk salinan teks berformat.

---

### Kawalan Antaramuka (UI)

| Kawalan | Tindakan |
|:---|:---|
| **`Ctrl + M`** | Papar / sembunyikan tetingkap alat pada bila-bila masa |
| **🌙 / ☀️** | Tukar antara mod gelap dan mod terang |
| **Seret Pengepala** | Klik dan tahan bahagian atas tetingkap untuk mengalihkan kedudukan |
| **Penjuru Bawah Kanan** | Klik dan seret penjuru untuk mengubah saiz tetingkap |
| **Pengepala Lajur Jadual** | Klik mana-mana tajuk lajur untuk menyusun data secara menaik atau menurun |

---

### Petua & Panduan Tambahan

- **Kekalkan Tab Aktif:** Biarkan tab Shopee terbuka sepanjang proses berjalan supaya pelayar tidak memperlahankan pemprosesan skrip latar belakang.
- **Mod Tidur Peranti:** Buka muzik latar atau tetapkan peranti anda agar tidak memasuki mod tidur (*sleep*) ketika memproses jumlah pesanan yang banyak.
- **Penyelesaian CAPTCHA:** Sekiranya keselamatan CAPTCHA dipaparkan, selesaikan secara manual; skrip akan menyambung semula pemprosesan secara automatik.

---

## Penafian / Disclaimer

Projek ini tidak berafiliasi dengan Shopee Mobile Malaysia Sdn. Bhd., Shopee Pte. Ltd., Sea Group, atau mana-mana anak syarikatnya dalam apa jua bentuk. Skrip ini dibangunkan semata-mata untuk kemudahan pengurusan dan pelaporan kewangan peribadi pengguna. Shopee dan logonya merupakan tanda dagangan dan hak cipta milik Shopee Pte. Ltd. Segala risiko penggunaan adalah di bawah tanggungjawab pengguna sendiri.

---

## Kredit / Credits

- **Adaptasi Shopee Malaysia:** [9M2PJU](https://github.com/9M2PJU)
- **Pembangun Asal:** [Ryu-Sena](https://github.com/tukangcode) | IndoTech Community & penambahbaikan antaramuka oleh [pataanggs](https://github.com/pataanggs)

---

## Lesen / License

Projek ini dilesenkan di bawah syarat [Lesen MIT](LICENSE).
