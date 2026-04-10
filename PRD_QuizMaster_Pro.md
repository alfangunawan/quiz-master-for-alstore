# Product Requirements Document
## QuizMaster Pro — Interactive Quiz Platform

---

| Field | Detail |
|---|---|
| Versi | 1.0.0 |
| Tanggal | April 2026 |
| Status | Draft — For Review |
| Platform | Web App (Next.js 14 App Router) |
| Tech Stack | Next.js 14, Tailwind CSS, Framer Motion, Prisma, PostgreSQL, Zustand, NextAuth.js |
| Author | Product Team |

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Tujuan Produk](#2-tujuan-produk)
3. [Target Pengguna](#3-target-pengguna)
4. [Arsitektur & Tech Stack](#4-arsitektur--tech-stack)
5. [Struktur Folder Project](#5-struktur-folder-project)
6. [Fitur User (Peserta Quiz)](#6-fitur-user-peserta-quiz)
7. [Fitur Admin (Pembuat Quiz)](#7-fitur-admin-pembuat-quiz)
8. [Desain UI/UX & Animasi](#8-desain-uiux--animasi)
9. [Database Schema](#9-database-schema)
10. [API Endpoints](#10-api-endpoints)
11. [Autentikasi & Otorisasi](#11-autentikasi--otorisasi)
12. [Non-Functional Requirements](#12-non-functional-requirements)
13. [Milestones & Timeline](#13-milestones--timeline)
14. [Out of Scope](#14-out-of-scope)
15. [Risiko & Mitigasi](#15-risiko--mitigasi)

---

## 1. Ringkasan Eksekutif

QuizMaster Pro adalah platform quiz interaktif berbasis web yang memungkinkan admin/guru membuat dan mengelola kuis, sementara user/peserta dapat mengikuti kuis secara real-time dengan pengalaman gamified yang menarik. Platform ini terinspirasi dari Quizizz namun dibangun dengan desain yang lebih modern, bersih, dan dapat dikustomisasi penuh.

---

## 2. Tujuan Produk

- Menyediakan platform quiz yang interaktif, responsif, dan engaging dengan elemen gamifikasi
- Memungkinkan admin membuat, mengelola, dan menganalisis quiz secara mudah
- Memberikan feedback instan kepada peserta untuk meningkatkan pengalaman belajar
- Mendukung berbagai tipe soal (pilihan ganda, benar/salah, isian singkat)
- Menyediakan leaderboard dan statistik hasil quiz secara real-time

---

## 3. Target Pengguna

### 3.1 User (Peserta Quiz)
- Pelajar / mahasiswa yang mengikuti quiz dari guru/dosen
- Peserta event atau kuis umum
- Siapapun yang mendapat link quiz dari admin

**Pain point:** Quiz konvensional membosankan, tidak ada feedback instan, dan tidak ada elemen kompetitif.

### 3.2 Admin (Pembuat Quiz)
- Guru / dosen / instruktur
- Event organizer
- HR perusahaan untuk assessment karyawan

**Pain point:** Membuat quiz yang menarik membutuhkan banyak tool berbeda dan sulit menganalisis hasilnya.

---

## 4. Arsitektur & Tech Stack

### 4.1 Frontend
| Teknologi | Kegunaan |
|---|---|
| Next.js 14 (App Router) | Framework utama, SSR, routing, API routes |
| Tailwind CSS | Styling utility-first, responsive design |
| Framer Motion | Animasi kartu, transisi halaman, feedback visual |
| Zustand | State management quiz session (skor, timer, progress) |
| React Hook Form | Form handling (login, register, buat soal) |
| Zod | Validasi schema form |
| Sonner | Toast notification |
| Recharts | Grafik hasil quiz di dashboard admin |

### 4.2 Backend
| Teknologi | Kegunaan |
|---|---|
| Next.js API Routes | REST API endpoints |
| NextAuth.js v5 | Autentikasi (Credentials, Google OAuth) |
| Prisma ORM | Database access layer |
| PostgreSQL | Database utama |
| Pusher / Ably | WebSocket untuk leaderboard real-time (opsional) |
| Cloudinary | Upload gambar soal/thumbnail quiz |
| Vercel | Deployment |

### 4.3 Development Tools
| Teknologi | Kegunaan |
|---|---|
| TypeScript | Type safety |
| ESLint + Prettier | Code quality |
| Husky | Git hooks |
| Jest + Testing Library | Unit & integration testing |
| Playwright | E2E testing |

---

## 5. Struktur Folder Project

```
quizmaster-pro/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (user)/
│   │   ├── dashboard/
│   │   ├── quiz/
│   │   │   ├── [code]/          ← join quiz via kode
│   │   │   └── [id]/play/       ← halaman bermain quiz
│   │   ├── history/             ← riwayat quiz user
│   │   └── leaderboard/
│   ├── (admin)/
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   ├── quiz/
│   │   │   │   ├── create/
│   │   │   │   ├── [id]/edit/
│   │   │   │   └── [id]/result/
│   │   │   ├── questions/
│   │   │   ├── participants/
│   │   │   └── analytics/
│   └── api/
│       ├── auth/
│       ├── quiz/
│       ├── question/
│       ├── session/
│       └── leaderboard/
├── components/
│   ├── ui/                      ← reusable UI components
│   ├── quiz/                    ← komponen quiz player
│   ├── admin/                   ← komponen admin panel
│   └── layout/
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   └── utils.ts
├── store/
│   └── quizStore.ts             ← Zustand store
├── types/
├── prisma/
│   └── schema.prisma
└── public/
```

---

## 6. Fitur User (Peserta Quiz)

### 6.1 Autentikasi User

#### 6.1.1 Register
- Form: nama lengkap, email, password, konfirmasi password
- Validasi: email unik, password min 8 karakter
- Opsi: daftar via Google OAuth
- Setelah register, langsung redirect ke dashboard user

#### 6.1.2 Login
- Form: email + password
- Login via Google OAuth
- "Remember me" (session 30 hari)
- Lupa password via email reset link
- Guest mode: bisa join quiz tanpa daftar (nama saja), tapi tidak bisa lihat riwayat

### 6.2 Dashboard User

**Tampilan:**
- Greeting dengan nama user
- Card statistik: Total Quiz Diikuti, Rata-rata Skor, Quiz Diselesaikan, Peringkat Terbaik
- Section "Quiz Aktif" — quiz yang sedang berjalan
- Section "Riwayat Quiz" — 5 quiz terakhir dengan skor
- Input kode quiz di bagian atas (prominent)

### 6.3 Join Quiz

#### 6.3.1 Via Kode
- User memasukkan kode 6 karakter (contoh: `QUIZ01`)
- Validasi kode: aktif, belum expired, kuota belum penuh
- Redirect ke halaman lobby/waiting room

#### 6.3.2 Via Link
- Admin share link langsung: `/quiz/QUIZ01`
- Auto-join ke lobby

#### 6.3.3 Lobby / Waiting Room
- Tampil nama quiz, thumbnail, jumlah peserta, dan countdown timer jika sudah diset admin
- Animasi masuk peserta baru (Framer Motion list animation)
- Tombol "Siap" — user konfirmasi siap
- Jika quiz dimulai otomatis, redirect semua user ke halaman play

### 6.4 Halaman Bermain Quiz

Ini adalah halaman inti dengan UX paling kritis.

#### 6.4.1 Layout Halaman Play
```
┌─────────────────────────────────────────┐
│  Logo   Soal 3/10   ⏱ 00:15   Poin:450  │
│─────────────────────────────────────────│
│         [Progress Bar Timer]            │
│─────────────────────────────────────────│
│                                         │
│    Pertanyaan: Apa ibu kota Jepang?     │
│         (thumbnail opsional)            │
│                                         │
│  ┌──────────┐  ┌──────────┐            │
│  │  1. Tokyo│  │ 2. Seoul │            │
│  └──────────┘  └──────────┘            │
│  ┌──────────┐  ┌──────────┐            │
│  │ 3. Osaka │  │ 4. Kyoto │            │
│  └──────────┘  └──────────┘            │
└─────────────────────────────────────────│
```

#### 6.4.2 Tipe Soal yang Didukung

| Tipe | Deskripsi |
|---|---|
| Pilihan Ganda | 2–4 opsi jawaban, satu benar |
| Benar / Salah | Dua opsi: True atau False |
| Isian Singkat | User ketik jawaban (case-insensitive match) |
| Multiple Select | Beberapa jawaban benar, semua harus dipilih |

#### 6.4.3 Sistem Skor
- Skor dasar: 1000 poin per jawaban benar
- Bonus kecepatan: semakin cepat menjawab, semakin besar bonus (max 500 poin tambahan)
- Formula: `skor = 1000 + (sisa_waktu / total_waktu) * 500`
- Jawaban salah: 0 poin (tidak ada pengurangan)
- Streak bonus: 3 jawaban benar berturut-turut = +100 poin bonus

#### 6.4.4 Timer Per Soal
- Default timer: 30 detik (bisa diatur admin per soal)
- Progress bar animasi countdown (Framer Motion)
- Warna berubah: hijau → kuning → merah saat mendekati habis
- Jika waktu habis, otomatis lanjut ke soal berikutnya (dianggap salah)

#### 6.4.5 Feedback Visual Jawaban
- Klik jawaban → kartu yang dipilih highlight (border putih)
- Setelah dikonfirmasi:
  - Benar: kartu berubah hijau + ikon centang + animasi confetti/sparkle
  - Salah: kartu berubah merah + animasi shake + tampilkan jawaban yang benar (highlight hijau)
- Delay 1.5 detik sebelum soal berikutnya
- Tampil poin yang didapat: "+1200 🔥" dengan animasi float-up

#### 6.4.6 Navigasi Soal
- Auto-advance ke soal berikutnya setelah feedback
- Tidak ada tombol "back" — soal tidak bisa diulang
- Progress indicator: "Soal 3 dari 10"

#### 6.4.7 Leaderboard Live (Opsional)
- Muncul setiap 3 soal sekali selama 3 detik
- Tampil top 5 peserta dengan skor terkini
- User bisa lihat posisinya sendiri (misal: "Kamu di posisi ke-7")
- Animasi slide-in dari kanan (Framer Motion)

### 6.5 Halaman Hasil Quiz

Ditampilkan setelah soal terakhir selesai.

**Konten:**
- Animasi score counter dari 0 ke total skor akhir
- Grade / predikat: Excellent (>90%), Good (70–89%), Fair (50–69%), Try Again (<50%)
- Ringkasan: Benar X / Salah Y / Total Soal Z
- Waktu total pengerjaan
- Akurasi persentase
- Review jawaban: list semua soal + jawaban user + jawaban benar
- Leaderboard final: top 10 peserta
- Tombol: "Main Lagi", "Bagikan Skor", "Kembali ke Dashboard"

### 6.6 Riwayat Quiz

- List semua quiz yang pernah diikuti
- Per item: nama quiz, tanggal, skor, akurasi, peringkat
- Filter: berdasarkan tanggal, skor tertinggi
- Klik untuk lihat detail review jawaban

### 6.7 Profil User

- Ubah nama, foto profil (upload via Cloudinary)
- Ubah password
- Statistik keseluruhan: total quiz, rata-rata skor, skor tertinggi
- Badge/achievement (opsional): "First Quiz", "Perfect Score", "Streak 5"

---

## 7. Fitur Admin (Pembuat Quiz)

### 7.1 Dashboard Admin

**Layout:** Sidebar navigasi kiri + konten kanan

**Widget Statistik:**
- Total Quiz Dibuat
- Total Peserta (semua quiz)
- Quiz Aktif Sekarang
- Rata-rata Skor Peserta

**Grafik (Recharts):**
- Grafik garis: jumlah peserta per hari (30 hari terakhir)
- Grafik donut: distribusi skor peserta (Excellent/Good/Fair/Try Again)

**Tabel Quiz Terbaru:**
- Nama quiz, tanggal dibuat, jumlah peserta, status, aksi

### 7.2 Manajemen Quiz

#### 7.2.1 Buat Quiz Baru

**Step 1 — Detail Quiz:**
- Judul quiz (required)
- Deskripsi (opsional)
- Thumbnail (upload gambar atau pilih dari preset)
- Kategori (Matematika, Sains, Bahasa, Sejarah, Umum, Custom)
- Tag (multi-input)
- Visibilitas: Publik / Private (hanya via kode) / Draft
- Batas waktu quiz: tanpa batas / set durasi
- Randomize urutan soal: ya/tidak
- Randomize urutan jawaban: ya/tidak
- Maksimum peserta: unlimited / set angka
- Tampilkan leaderboard live: ya/tidak
- Izinkan guest (tanpa login): ya/tidak

**Step 2 — Buat Soal:**
- Tombol "+ Tambah Soal"
- Drag-and-drop untuk urutkan soal
- Per soal memiliki:
  - Tipe soal (pilihan ganda / benar-salah / isian / multiple select)
  - Teks pertanyaan (rich text: bold, italic, gambar inline)
  - Upload gambar soal (opsional)
  - Opsi jawaban (min 2, max 4 untuk pilihan ganda)
  - Tandai jawaban benar
  - Waktu per soal: 10 / 15 / 20 / 30 / 45 / 60 / 90 detik
  - Poin per soal: 500 / 1000 / 2000 (custom)
  - Penjelasan jawaban (ditampilkan setelah user menjawab, opsional)
- Preview soal real-time di panel kanan
- Tombol duplikat soal
- Tombol hapus soal (dengan konfirmasi)
- Validasi: minimal 1 soal sebelum simpan

**Step 3 — Review & Publish:**
- Ringkasan: jumlah soal, estimasi waktu total
- Preview mode: simulasi tampilan user
- Tombol: Simpan Draft / Publish

#### 7.2.2 Edit Quiz
- Semua field di Step 1 dan Step 2 bisa diubah
- Quiz yang sedang aktif (ada peserta bermain): hanya bisa edit judul, deskripsi, dan visibilitas. Soal tidak bisa diubah saat quiz berlangsung.
- Riwayat perubahan (audit log sederhana)

#### 7.2.3 Kelola Quiz (List View)

**Tabel kolom:** Thumbnail, Judul, Kategori, Soal, Peserta, Status, Kode, Dibuat, Aksi

**Filter & Pencarian:**
- Search by judul
- Filter by: status (Draft/Aktif/Selesai/Diarsipkan), kategori, rentang tanggal

**Aksi per quiz:**
- Edit, Duplikat, Arsipkan, Hapus
- Lihat Hasil
- Share link / kode
- Start / Stop quiz

#### 7.2.4 Kode Quiz
- Auto-generate kode unik 6 karakter saat publish
- Admin bisa regenerate kode
- QR Code generator untuk kode quiz (download sebagai PNG)
- Tombol copy link langsung

### 7.3 Manajemen Soal (Bank Soal)

- Library soal yang bisa digunakan ulang di quiz berbeda
- Buat soal independen dari quiz
- Tag soal untuk pencarian mudah
- Import soal dari CSV (format template disediakan)
- Export soal ke CSV
- Duplikat soal ke quiz lain

**Format CSV Import:**
```
type,question,option_a,option_b,option_c,option_d,correct,time,points
multiple,Apa ibu kota Indonesia?,Jakarta,Surabaya,Bandung,Medan,A,30,1000
truefalse,Bumi berbentuk datar?,,,,,False,15,1000
```

### 7.4 Manajemen Peserta

- List semua peserta yang pernah ikut quiz
- Per peserta: nama, email, quiz yang diikuti, skor rata-rata
- Export data peserta ke CSV/Excel
- Blacklist peserta (blokir dari quiz tertentu)
- Manual tambah peserta ke quiz (invite by email)

### 7.5 Hasil & Analitik Quiz

#### 7.5.1 Halaman Hasil per Quiz

**Summary Cards:**
- Total peserta, Rata-rata skor, Skor tertinggi, Skor terendah, Rata-rata waktu

**Grafik:**
- Distribusi skor (histogram)
- Akurasi per soal (bar chart) — soal mana yang paling banyak salah
- Timeline peserta join (kapan paling ramai)

**Leaderboard:**
- Ranking peserta dengan skor, waktu, akurasi
- Highlight top 3 dengan lencana emas/perak/perunggu
- Export leaderboard ke CSV

**Review Per Soal:**
- Tabel: soal, % benar, % salah, jawaban terpopuler
- Klik soal untuk lihat distribusi jawaban (pie chart)

#### 7.5.2 Analitik Global

- Performa semua quiz dalam satu dashboard
- Tren peserta over time
- Quiz paling populer (by peserta)
- Quiz dengan rata-rata skor tertinggi/terendah
- Export laporan PDF (menggunakan browser print)

### 7.6 Pengaturan Admin

- **Profil:** nama, foto, email, password
- **Notifikasi:** email notif saat quiz selesai, saat ada peserta baru
- **Branding:** upload logo, pilih warna tema primary (untuk white-label)
- **Integrasi:** webhook URL untuk notifikasi eksternal (opsional)
- **Danger Zone:** hapus akun, hapus semua data quiz

### 7.7 Manajemen User (Super Admin)

Hanya untuk role Super Admin:

- List semua user dan admin terdaftar
- Promote user menjadi admin
- Suspend / aktifkan akun
- Reset password user
- Lihat aktivitas user (quiz yang diikuti)

---

## 8. Desain UI/UX & Animasi

### 8.1 Design System

**Palet Warna:**
| Token | Hex | Kegunaan |
|---|---|---|
| Primary | `#6C5CE7` | CTA, highlight utama |
| Secondary | `#0984E3` | Info, link |
| Success | `#00B894` | Jawaban benar, konfirmasi |
| Danger | `#D63031` | Jawaban salah, error |
| Warning | `#FDCB6E` | Timer hampir habis |
| Dark | `#1A0D3D` | Background quiz (mode gelap) |
| Surface | `#2D1B69` | Card background quiz |

**Opsi Warna Kartu Jawaban (Quizizz-inspired):**
- Opsi 1: Biru `#0984E3`
- Opsi 2: Teal `#00B894`
- Opsi 3: Oranye `#E17055`
- Opsi 4: Ungu `#A29BFE`

**Tipografi:**
- Font: Inter (Google Fonts)
- Heading: 700 weight
- Body: 400 weight
- Soal quiz: min 24px, bold, centered

**Border Radius:**
- Kartu soal: 16px
- Kartu jawaban: 12px
- Button: 8px
- Badge: 999px (pill)

### 8.2 Animasi Framer Motion

#### Halaman Quiz (Soal Masuk)
```typescript
// Kartu soal: staggered entrance
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 }
  }
}
const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
}
```

#### Feedback Jawaban Benar
```typescript
const correctVariants = {
  initial: { scale: 1 },
  correct: {
    scale: [1, 1.05, 1],
    backgroundColor: ["#0984E3", "#00B894"],
    transition: { duration: 0.4 }
  }
}
```

#### Feedback Jawaban Salah (Shake)
```typescript
const wrongVariants = {
  initial: { x: 0 },
  wrong: {
    x: [-8, 8, -8, 8, 0],
    backgroundColor: ["#0984E3", "#D63031"],
    transition: { duration: 0.4 }
  }
}
```

#### Poin Float-Up
```typescript
const pointsVariants = {
  initial: { opacity: 0, y: 0 },
  animate: { opacity: [0, 1, 0], y: -60 },
  transition: { duration: 1.2 }
}
```

#### Transisi Halaman
```typescript
// Layout wrapper
<AnimatePresence mode="wait">
  <motion.div
    key={pathname}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

#### Timer Progress Bar
```typescript
<motion.div
  style={{ width: "100%" }}
  animate={{ width: `${(remainingTime / totalTime) * 100}%` }}
  transition={{ duration: 1, ease: "linear" }}
/>
```

#### Score Counter (Hasil Quiz)
```typescript
// Gunakan useMotionValue + useTransform + animate
const count = useMotionValue(0)
animate(count, finalScore, { duration: 2, ease: "easeOut" })
```

#### Leaderboard Live (Slide In)
```typescript
const leaderboardVariants = {
  hidden: { x: "100%", opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 200 } },
  exit: { x: "100%", opacity: 0 }
}
```

### 8.3 Responsiveness

| Breakpoint | Layout |
|---|---|
| Mobile < 768px | Single column, kartu jawaban 1 per baris atau 2x2 |
| Tablet 768–1024px | 2 kolom kartu jawaban |
| Desktop > 1024px | 2–3 kolom kartu jawaban, sidebar admin |

**Touch targets:** Minimum 48x48px untuk semua elemen interaktif.

### 8.4 Aksesibilitas

- Keyboard navigasi: tekan `1`, `2`, `3`, `4` untuk pilih jawaban, `Enter` untuk konfirmasi
- ARIA labels pada semua elemen interaktif
- Focus ring yang jelas (`ring-2 ring-primary`)
- Warna tidak satu-satunya indikator (selalu ada ikon centang/silang)
- Contrast ratio minimum 4.5:1 untuk semua teks
- Screen reader friendly (semantic HTML)

---

## 9. Database Schema

### 9.1 Prisma Schema

```prisma
model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  password      String?
  image         String?
  role          Role      @default(USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  sessions      QuizSession[]
  quizzesCreated Quiz[]

  @@map("users")
}

enum Role {
  USER
  ADMIN
  SUPER_ADMIN
}

model Quiz {
  id              String    @id @default(cuid())
  title           String
  description     String?
  thumbnail       String?
  category        String?
  tags            String[]
  code            String    @unique
  visibility      Visibility @default(PRIVATE)
  status          QuizStatus @default(DRAFT)
  randomizeQ      Boolean   @default(false)
  randomizeA      Boolean   @default(false)
  maxParticipants Int?
  showLiveBoard   Boolean   @default(true)
  allowGuest      Boolean   @default(false)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  publishedAt     DateTime?

  createdBy       User      @relation(fields: [createdById], references: [id])
  createdById     String
  questions       Question[]
  sessions        QuizSession[]

  @@map("quizzes")
}

enum Visibility {
  PUBLIC
  PRIVATE
  DRAFT
}

enum QuizStatus {
  DRAFT
  ACTIVE
  FINISHED
  ARCHIVED
}

model Question {
  id          String        @id @default(cuid())
  quizId      String
  type        QuestionType
  text        String
  image       String?
  options     Json          // Array of {id, text, isCorrect}
  explanation String?
  timeLimit   Int           @default(30)
  points      Int           @default(1000)
  order       Int

  quiz        Quiz          @relation(fields: [quizId], references: [id], onDelete: Cascade)
  answers     Answer[]

  @@map("questions")
}

enum QuestionType {
  MULTIPLE_CHOICE
  TRUE_FALSE
  SHORT_ANSWER
  MULTIPLE_SELECT
}

model QuizSession {
  id           String    @id @default(cuid())
  quizId       String
  userId       String?
  guestName    String?
  score        Int       @default(0)
  totalTime    Int       @default(0)
  accuracy     Float     @default(0)
  rank         Int?
  completedAt  DateTime?
  createdAt    DateTime  @default(now())

  quiz         Quiz      @relation(fields: [quizId], references: [id])
  user         User?     @relation(fields: [userId], references: [id])
  answers      Answer[]

  @@map("quiz_sessions")
}

model Answer {
  id           String      @id @default(cuid())
  sessionId    String
  questionId   String
  selectedOption Json      // Array of selected option ids
  isCorrect    Boolean
  pointsEarned Int
  timeSpent    Int
  createdAt    DateTime    @default(now())

  session      QuizSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  question     Question    @relation(fields: [questionId], references: [id])

  @@map("answers")
}
```

---

## 10. API Endpoints

### 10.1 Auth
| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register user baru | Public |
| POST | `/api/auth/login` | Login (NextAuth) | Public |
| POST | `/api/auth/forgot-password` | Kirim email reset | Public |
| POST | `/api/auth/reset-password` | Reset password via token | Public |

### 10.2 Quiz (User)
| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| GET | `/api/quiz/join/[code]` | Validasi & join quiz via kode | User/Guest |
| GET | `/api/quiz/[id]/play` | Ambil data soal untuk dimainkan | User/Guest |
| POST | `/api/quiz/[id]/submit` | Submit jawaban per soal | User/Guest |
| POST | `/api/quiz/[id]/finish` | Selesaikan sesi quiz | User/Guest |
| GET | `/api/quiz/[id]/result` | Ambil hasil quiz user | User |
| GET | `/api/quiz/[id]/leaderboard` | Ambil leaderboard quiz | User |

### 10.3 Quiz (Admin)
| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| GET | `/api/admin/quiz` | List semua quiz admin | Admin |
| POST | `/api/admin/quiz` | Buat quiz baru | Admin |
| GET | `/api/admin/quiz/[id]` | Detail quiz | Admin |
| PUT | `/api/admin/quiz/[id]` | Update quiz | Admin |
| DELETE | `/api/admin/quiz/[id]` | Hapus quiz | Admin |
| POST | `/api/admin/quiz/[id]/publish` | Publish quiz | Admin |
| POST | `/api/admin/quiz/[id]/start` | Start quiz session | Admin |
| POST | `/api/admin/quiz/[id]/stop` | Stop quiz session | Admin |
| GET | `/api/admin/quiz/[id]/analytics` | Analitik hasil quiz | Admin |
| POST | `/api/admin/quiz/[id]/duplicate` | Duplikat quiz | Admin |

### 10.4 Soal (Admin)
| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| GET | `/api/admin/question` | Bank soal admin | Admin |
| POST | `/api/admin/question` | Buat soal baru | Admin |
| PUT | `/api/admin/question/[id]` | Update soal | Admin |
| DELETE | `/api/admin/question/[id]` | Hapus soal | Admin |
| POST | `/api/admin/question/import` | Import soal dari CSV | Admin |
| GET | `/api/admin/question/export` | Export soal ke CSV | Admin |

### 10.5 User & Peserta
| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| GET | `/api/user/profile` | Profil user | User |
| PUT | `/api/user/profile` | Update profil | User |
| GET | `/api/user/history` | Riwayat quiz user | User |
| GET | `/api/admin/participants` | List peserta semua quiz | Admin |
| GET | `/api/admin/analytics` | Analitik global | Admin |

---

## 11. Autentikasi & Otorisasi

### 11.1 Roles & Permissions

| Fitur | Guest | User | Admin | Super Admin |
|---|---|---|---|---|
| Join quiz via kode | ✅ | ✅ | ✅ | ✅ |
| Lihat riwayat quiz | ❌ | ✅ | ✅ | ✅ |
| Buat quiz | ❌ | ❌ | ✅ | ✅ |
| Edit quiz sendiri | ❌ | ❌ | ✅ | ✅ |
| Hapus quiz sendiri | ❌ | ❌ | ✅ | ✅ |
| Lihat analytics | ❌ | ❌ | ✅ | ✅ |
| Kelola semua user | ❌ | ❌ | ❌ | ✅ |
| Promote admin | ❌ | ❌ | ❌ | ✅ |

### 11.2 Middleware Route Protection

```typescript
// middleware.ts
export const config = {
  matcher: [
    "/admin/:path*",    // → wajib role ADMIN atau SUPER_ADMIN
    "/dashboard/:path*", // → wajib login
    "/quiz/:path*/play", // → bisa guest dengan nama
  ]
}
```

### 11.3 Session Strategy
- JWT strategy via NextAuth.js
- Access token: 1 jam
- Refresh token: 30 hari (jika "remember me" aktif)
- Guest session: disimpan di localStorage, expire 24 jam

---

## 12. Non-Functional Requirements

### 12.1 Performa
- First Contentful Paint (FCP): < 1.5 detik
- Largest Contentful Paint (LCP): < 2.5 detik
- Time to Interactive (TTI): < 3 detik
- Halaman play quiz harus load dalam < 1 detik setelah soal pertama dimuat
- API response time: < 300ms untuk semua endpoint quiz

### 12.2 Skalabilitas
- Mendukung hingga 500 peserta concurrently dalam satu quiz session
- Database connection pooling via Prisma
- Image upload di-handle Cloudinary (CDN), tidak disimpan di server

### 12.3 Keamanan
- Semua password di-hash dengan bcrypt (salt rounds: 12)
- Rate limiting pada endpoint auth: 5 request/menit per IP
- Rate limiting pada endpoint submit jawaban: 1 request/10 detik per user
- CSRF protection via NextAuth.js
- Input sanitization pada semua form
- SQL injection prevention via Prisma ORM
- XSS prevention via Next.js built-in escaping
- API routes hanya bisa diakses dari domain yang terdaftar (CORS)

### 12.4 Ketersediaan
- Target uptime: 99.5%
- Deployment di Vercel (auto-scaling)
- Database di Supabase atau Railway (managed PostgreSQL)

### 12.5 Browser Support
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Mobile: iOS Safari 14+, Android Chrome 90+

---

## 13. Milestones & Timeline

| Sprint | Durasi | Deliverable |
|---|---|---|
| Sprint 1 | 2 minggu | Setup project, auth (register/login/Google OAuth), database schema, layout dasar |
| Sprint 2 | 2 minggu | Fitur buat quiz (admin), form soal, bank soal, preview |
| Sprint 3 | 2 minggu | Halaman play quiz (user): timer, feedback, animasi Framer Motion, sistem skor |
| Sprint 4 | 2 minggu | Halaman hasil, leaderboard, riwayat quiz user |
| Sprint 5 | 2 minggu | Dashboard admin, analitik, grafik Recharts, export CSV |
| Sprint 6 | 1 minggu | Import soal CSV, QR code, manajemen peserta |
| Sprint 7 | 1 minggu | Testing (Jest, Playwright), bug fixing, optimasi performa |
| Sprint 8 | 1 minggu | Staging deployment, UAT, production release |

**Total estimasi: ±13 minggu (3 bulan)**

---

## 14. Out of Scope (v1.0)

Fitur-fitur berikut tidak termasuk dalam versi 1.0 dan akan dipertimbangkan untuk versi berikutnya:

- Real-time multiplayer sync (WebSocket Pusher) — hanya polling untuk leaderboard
- Video/audio dalam soal
- Quiz kolaboratif (admin bisa co-edit)
- Sistem subscription/pembayaran
- Mobile app (iOS/Android)
- AI generate soal otomatis
- Integrasi LMS (Google Classroom, Moodle)
- Multi-bahasa (i18n)
- Dark mode toggle (default dark untuk halaman play, light untuk admin)

---

## 15. Risiko & Mitigasi

| Risiko | Dampak | Kemungkinan | Mitigasi |
|---|---|---|---|
| Banyak peserta join bersamaan menyebabkan DB overload | Tinggi | Sedang | Connection pooling Prisma, query optimization, caching soal di Redis (v2) |
| Timer tidak sinkron antar device | Sedang | Tinggi | Timer berbasis server-side timestamp, bukan client clock |
| User curang (kirim jawaban manual via API) | Sedang | Rendah | Rate limiting + validasi sesi server-side |
| Cloudinary CDN lambat | Sedang | Rendah | Fallback ke placeholder image, compress sebelum upload |
| Prisma migration gagal di production | Tinggi | Rendah | Selalu backup DB sebelum migration, gunakan staging environment |
| Framer Motion overhead pada device lemah | Rendah | Sedang | `prefers-reduced-motion` media query, disable animasi di setting |

---

## Appendix

### A. Contoh Kode Quiz Session Store (Zustand)

```typescript
// store/quizStore.ts
import { create } from 'zustand'

interface QuizState {
  sessionId: string | null
  currentQuestionIndex: number
  score: number
  streak: number
  answers: AnswerRecord[]
  timeRemaining: number

  setSession: (id: string) => void
  submitAnswer: (questionId: string, selected: string[], isCorrect: boolean, points: number, timeSpent: number) => void
  nextQuestion: () => void
  resetQuiz: () => void
}

export const useQuizStore = create<QuizState>((set) => ({
  sessionId: null,
  currentQuestionIndex: 0,
  score: 0,
  streak: 0,
  answers: [],
  timeRemaining: 30,

  setSession: (id) => set({ sessionId: id }),

  submitAnswer: (questionId, selected, isCorrect, points, timeSpent) =>
    set((state) => ({
      score: state.score + points,
      streak: isCorrect ? state.streak + 1 : 0,
      answers: [...state.answers, { questionId, selected, isCorrect, points, timeSpent }]
    })),

  nextQuestion: () =>
    set((state) => ({ currentQuestionIndex: state.currentQuestionIndex + 1 })),

  resetQuiz: () =>
    set({ sessionId: null, currentQuestionIndex: 0, score: 0, streak: 0, answers: [], timeRemaining: 30 })
}))
```

### B. Contoh Environment Variables

```env
# .env.local

# Database
DATABASE_URL="postgresql://user:pass@host:5432/quizmaster"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Cloudinary
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

*Dokumen ini bersifat living document dan akan diperbarui seiring perkembangan project.*

*Versi 1.0.0 — April 2026*
