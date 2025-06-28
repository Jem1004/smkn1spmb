# PPDB SMK Digital

Sistem Penerimaan Peserta Didik Baru (PPDB) untuk SMK dengan teknologi modern.

## 🚀 Fitur Utama

### Admin Dashboard
- **Manajemen Siswa**: Tambah, edit, hapus, dan lihat data siswa
- **Dashboard Analytics**: Statistik pendaftaran dan status siswa
- **Sistem Ranking**: Penilaian otomatis berdasarkan nilai akademik dan prestasi
- **Filter & Search**: Pencarian dan filter data siswa berdasarkan berbagai kriteria
- **Export Data**: Ekspor data siswa untuk keperluan administrasi

### Student Portal
- **Status Pendaftaran**: Siswa dapat melihat status pendaftaran mereka
- **Timeline Proses**: Tracking progress pendaftaran
- **Data Pribadi**: Tampilan lengkap informasi yang telah didaftarkan
- **Update Kontak**: Siswa dapat memperbarui informasi kontak

### Form Wizard Pendaftaran
1. **Data Pribadi**: Informasi personal siswa
2. **Data Orang Tua**: Informasi orang tua/wali
3. **Data Pendidikan**: Riwayat pendidikan sebelumnya
4. **Pilihan Jurusan**: Pilihan program keahlian (3 pilihan)
5. **Kelengkapan Dokumen**: Checklist dokumen persyaratan
6. **Penilaian**: Input nilai akademik dan prestasi

### Sistem Penilaian
- **Nilai Akademik**: Matematika, Bahasa Indonesia, Bahasa Inggris, IPA
- **Prestasi**: Akademik, Non-akademik, dan prestasi lainnya
- **Ranking Otomatis**: Perhitungan ranking berdasarkan total skor
- **Bobot Penilaian**: Sistem pembobotan yang adil dan transparan

## 🛠️ Teknologi

### Frontend
- **Next.js 14**: React framework dengan App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Modern UI components
- **Radix UI**: Accessible component primitives
- **Lucide React**: Beautiful icons

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **Prisma**: Modern database toolkit
- **PostgreSQL**: Robust relational database
- **JWT**: Secure authentication
- **bcryptjs**: Password hashing

### State Management
- **Zustand**: Lightweight state management
- **Persistent Storage**: Local storage integration

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Static type checking
- **Docker**: Containerization for database

## 📋 Prerequisites

- Node.js 18+ 
- npm atau yarn
- Docker (untuk database)
- Git

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd smksatu-ppdb
```

### 2. Install Dependencies
```bash
npm install
# atau
yarn install
```

### 3. Setup Environment
```bash
cp .env.example .env
```

Edit file `.env` dan sesuaikan dengan konfigurasi Anda:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/ppdb_db"
JWT_SECRET="your-super-secret-jwt-key"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="PPDB SMK Digital"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Setup Database
```bash
# Start PostgreSQL dengan Docker
docker-compose up -d

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# (Optional) Seed database
npm run db:seed
```

### 5. Run Development Server
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 📁 Struktur Proyek

```
smksatu-ppdb/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin pages
│   ├── api/               # API routes
│   ├── login/             # Login page
│   ├── student/           # Student pages
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   └── ui/               # Shadcn/ui components
├── lib/                   # Utility libraries
│   ├── auth.ts           # Authentication utilities
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # General utilities
├── modules/               # Feature modules
│   └── students/         # Student-related components
├── prisma/               # Database schema & migrations
├── store/                # Zustand stores
├── types/                # TypeScript type definitions
└── README.md
```

## 🔐 Authentication

### Default Accounts

**Admin Account:**
- Username: `admin`
- Password: `admin123`
- Role: `admin`

**Student Account:**
- Username: `student`
- Password: `student123`
- Role: `student`

### Roles & Permissions

| Role | Permissions |
|------|-------------|
| Admin | - Manage all students<br>- View dashboard analytics<br>- Export data<br>- Update student status |
| Student | - View own registration status<br>- Update contact information<br>- View timeline progress |

## 🗃️ Database Schema

### User
- `id`: Primary key
- `username`: Unique username
- `password`: Hashed password
- `role`: User role (admin/student)

### Student
- Personal information (nama, tempat/tanggal lahir, dll)
- Parent information (data orang tua)
- Education history (riwayat pendidikan)
- Major choices (pilihan jurusan)
- Document checklist (kelengkapan dokumen)
- Registration status (status pendaftaran)

### Ranking
- Academic scores (nilai akademik)
- Achievement levels (tingkat prestasi)
- Total score (skor total)
- Rank position (posisi ranking)

## 🎯 Jurusan yang Tersedia

1. **TKJ** - Teknik Komputer dan Jaringan
2. **RPL** - Rekayasa Perangkat Lunak
3. **MM** - Multimedia
4. **TKR** - Teknik Kendaraan Ringan
5. **TEI** - Teknik Elektronika Industri

## 📊 Sistem Penilaian

### Komponen Nilai
1. **Nilai Akademik (100 poin max)**
   - Matematika (25%)
   - Bahasa Indonesia (25%)
   - Bahasa Inggris (25%)
   - IPA (25%)

2. **Prestasi (Bonus Points)**
   - Tingkat Sekolah: +5 poin
   - Tingkat Kecamatan: +10 poin
   - Tingkat Kabupaten/Kota: +15 poin
   - Tingkat Provinsi: +20 poin
   - Tingkat Nasional: +25 poin
   - Tingkat Internasional: +30 poin

### Formula Ranking
```
Total Skor = Rata-rata Akademik + Poin Prestasi
Ranking = Urutan berdasarkan Total Skor (tertinggi ke terendah)
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push code ke GitHub
2. Connect repository ke Vercel
3. Set environment variables
4. Deploy

### Docker
```bash
# Build image
docker build -t ppdb-app .

# Run container
docker run -p 3000:3000 ppdb-app
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📝 API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Students
- `GET /api/students` - Get all students (Admin)
- `POST /api/students` - Create student (Admin)
- `GET /api/students/[id]` - Get student by ID (Admin)
- `PUT /api/students/[id]` - Update student (Admin)
- `DELETE /api/students/[id]` - Delete student (Admin)
- `GET /api/students/me` - Get current student data (Student)
- `PUT /api/students/me` - Update current student data (Student)

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: [Your Name]
- **Designer**: [Designer Name]
- **Project Manager**: [PM Name]

## 📞 Support

Jika Anda mengalami masalah atau memiliki pertanyaan:

- 📧 Email: astrodigiso@gmail.com
- 📱 WhatsApp: +62 xxx-xxxx-xxxx


---

**PPDB SMK Digital** - Memudahkan proses penerimaan siswa baru dengan teknologi modern! 🎓✨
