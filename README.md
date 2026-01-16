# LMS TI UIGM (Modernized E-Learning Platform) 🎓

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://postgresql.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://typescriptlang.org/)

**Sistem Manajemen Pembelajaran (LMS)** yang dirancang dan dimodifikasi khusus untuk mendukung kegiatan akademik di lingkungan **Program Studi Teknik Informatika - Universitas Indo Global Mandiri (UIGM)**.

---

> **⚠️ Acknowledgement & Kredit Pengembang:**
>
> Proyek ini merupakan **pengembangan lanjutan (fork)** dari basis kode open source "LMS Universitas v1" karya [HaikalE](https://github.com/HaikalE/lms-universitas-v1).
>
> **Modifikasi & Fitur Baru oleh Tim Indo Global Learning (UIGM):**
> * Integrasi logika Absensi Otomatis berbasis Video (*Video Completion Logic*).
> * Penambahan fitur *Syntax Highlighting* pada Forum Diskusi.
> * Optimasi infrastruktur Docker & Nginx untuk stabilitas *deployment*.
> * Penyesuaian UI/UX dan *business logic* sesuai kebutuhan studi kasus.

---

## ✨ Fitur Unggulan (Modifikasi Tim)

Selain fitur standar LMS, versi ini telah dilengkapi dengan kemampuan khusus:

### 1. 🎥 Absensi Otomatis Berbasis Video (Weekly Attendance)
Sistem kehadiran cerdas yang memvalidasi absensi mahasiswa secara otomatis. Mahasiswa hanya dianggap "Hadir" pada minggu tersebut jika telah menyelesaikan tontonan video materi wajib hingga persentase tertentu (misal: 80%).

### 2. 💻 Forum Diskusi IT (Syntax Highlighting)
Dirancang untuk mahasiswa Informatika. Editor forum diskusi mendukung penulisan blok kode program (Code Snippets) dengan pewarnaan sintaks (*syntax highlighting*) untuk bahasa seperti C++, Java, Python, dan JavaScript, memudahkan diskusi teknis.

### 3. 📱 Progressive Web App (PWA)
Aplikasi mendukung instalasi langsung ke perangkat desktop atau mobile (*Install to Home Screen*) dan memiliki kemampuan caching untuk akses yang lebih cepat.

### 4. 🛠️ Infrastructure Hardening
Perbaikan signifikan pada konfigurasi Docker dan Nginx untuk mencegah masalah *blank page* dan memastikan aplikasi berjalan stabil di lingkungan produksi maupun lokal.

---

## 📋 Fitur Utama Sistem

### 👨‍🎓 Modul Mahasiswa
- **Dashboard Personal:** Ringkasan progres studi, tugas pending, dan notifikasi.
- **Akses Materi:** Streaming video pembelajaran dan unduh materi PDF/Dokumen.
- **Manajemen Tugas:** Upload tugas (mendukung berbagai format) dengan fitur *Simpan Draft* sebelum pengumpulan final.
- **Akademik:** Cek nilai tugas dan umpan balik (*feedback*) dari dosen.

### 👨‍🏫 Modul Dosen
- **Course Management:** Membuat mata kuliah, upload materi per minggu, dan manajemen sesi.
- **Quick Grading:** Antarmuka penilaian tugas yang cepat dan efisien.
- **Student Enrollment:** Menambahkan mahasiswa ke kelas secara manual atau massal (*bulk*).
- **Monitoring:** Memantau siapa saja yang sudah menonton video materi (Tracking Progress).

### 👨‍💼 Modul Administrator
- **User Management:** Kelola akun Dosen, Mahasiswa, dan Staff.
- **Curriculum:** Pengaturan data induk mata kuliah.
- **System Config:** Pengaturan global sistem.

---

## 🛠️ Teknologi

* **Backend:** NestJS (Node.js Framework), TypeORM
* **Frontend:** React 18, Tailwind CSS, TypeScript
* **Database:** PostgreSQL 14+
* **Containerization:** Docker & Docker Compose

---

## 🚀 Panduan Instalasi (Quick Start)

Kami menyarankan penggunaan **Docker** untuk instalasi yang paling mudah dan bebas konflik dependensi.

### Metode 1: Menggunakan Docker (Recommended)

Kami telah menyiapkan script otomatis `ultimate-nginx-fix.sh` yang menangani *build*, konfigurasi database, dan perbaikan *proxy* sekaligus.

1.  **Clone Repository:**
    ```bash
    git clone [https://github.com/ibnuaditiyo/lms-ti-uigm.git](https://github.com/ibnuaditiyo/lms-ti-uigm.git)
    cd lms-ti-uigm
    ```

2.  **Jalankan Script Deploy Otomatis:**
    ```bash
    chmod +x ultimate-nginx-fix.sh
    ./ultimate-nginx-fix.sh
    ```
    *Script ini akan otomatis membangun container, menunggu database siap, dan memastikan halaman web dapat diakses di `http://localhost:3001`.*

### Metode 2: Setup Manual (Tanpa Docker)

Jika Anda ingin menjalankan secara manual di local machine:

1.  **Setup Database:**
    Pastikan PostgreSQL berjalan dan buat database bernama `lms_db`.

2.  **Setup Backend:**
    ```bash
    cd backend
    cp .env.example .env
    # Sesuaikan konfigurasi DB di file .env
    npm install
    npm run migration:run
    npm run seed
    npm run start:dev
    ```

3.  **Setup Frontend:**
    ```bash
    cd frontend
    npm install --legacy-peer-deps
    npm start
    ```

---

## 🔐 Akun Demo

Gunakan akun berikut untuk login dan menguji sistem:

| Role | Email | Password |
|------|-------|----------|
| **Administrator** | `admin@uigm.ac.id` | `admin123` |
| **Dosen** | `dosen@uigm.ac.id` | `lecturer123` |
| **Mahasiswa** | `mahasiswa@student.uigm.ac.id` | `student123` |

---

## 🐛 Troubleshooting

Jika Anda mengalami kendala saat instalasi:

* **Masalah:** Halaman depan muncul "Welcome to Nginx" atau layar putih.
    * **Solusi:** Jalankan `./ultimate-nginx-fix.sh`. Script ini akan memaksa regenerasi konfigurasi Nginx yang benar.
* **Masalah:** Error saat `npm install` di Frontend.
    * **Solusi:** Gunakan perintah `npm install --legacy-peer-deps` untuk menangani konflik versi library React terbaru.

---

## 👥 Tim Pengembang

**PT. Indo Global Learning**
* **Project Manager & Lead Developer:** Ibnu Aditiyo
* **Institusi:** Universitas Indo Global Mandiri (UIGM)

---

<div align="center">
  <p>Disusun untuk memenuhi Tugas Akhir Mata Kuliah Manajemen Proyek Perangkat Lunak (MPPL)</p>
  <p><strong>Tahun 2026</strong></p>
</div>