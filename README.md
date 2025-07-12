# POS Kantin - Sistem Point of Sale untuk Kantin Sekolah

Sistem POS modern untuk mengelola transaksi kantin sekolah dengan fitur manajemen siswa, produk, dan pembayaran digital.

## 🚀 Fitur Utama

- **Dashboard Admin**: Manajemen siswa, produk, dan laporan
- **Dashboard Kasir**: POS dengan QR code dan pencarian siswa
- **Dashboard Siswa**: Cek saldo dan riwayat transaksi
- **Dashboard Orang Tua**: Top up saldo untuk anak
- **Top Up Manual oleh Admin**: Admin dapat menambah saldo siswa secara manual melalui dashboard, dan setiap top up akan otomatis tercatat di riwayat top up siswa dan orang tua.
- **Riwayat Top Up & Transaksi**: Siswa dan orang tua dapat melihat riwayat top up & transaksi dengan tampilan tabs, lengkap dengan label sumber top up (oleh admin/orang tua).
- **Sistem Autentikasi**: Multi-role dengan JWT
- **Database**: PostgreSQL dengan Prisma ORM

## 🛠️ Teknologi

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT, bcryptjs
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database
- npm atau yarn

## 🚀 Setup Development

### 1. Clone Repository

```bash
git clone <repository-url>
cd pos_kantin
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Buat file `.env` di root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/pos_kantin"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-here"
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with sample data
npm run db:seed
```

### 5. Run Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## 📊 Database Schema

### Models Utama:

- **User**: Autentikasi multi-role (Admin, Cashier, Student, Parent)
- **Student**: Data siswa dengan saldo
- **Product**: Produk kantin dengan kategori
- **Transaction**: Transaksi dengan items
- **TopUp**: Top up saldo siswa
- **ParentStudent**: Relasi orang tua-siswa

### Enums:

- **UserRole**: ADMIN, CASHIER, STUDENT, PARENT
- **ProductCategory**: MAKANAN_BERAT, MAKANAN_RINGAN, MINUMAN, SNACK
- **TransactionStatus**: PENDING, COMPLETED, CANCELLED, REFUNDED
- **PaymentMethod**: CASH, QR_CODE, TRANSFER, E_WALLET

## 👥 User Roles & Access

### Admin

- **Email**: admin@sman1jakarta.sch.id
- **Password**: admin123
- **Fitur**: Manajemen siswa, produk, laporan, pengaturan

### Cashier

- **Email**: cashier@sman1jakarta.sch.id
- **Password**: cashier123
- **Fitur**: POS, scan QR, transaksi

### Student

- **Email**: student@example.com
- **Password**: student123
- **Fitur**: Cek saldo, riwayat transaksi

### Parent

- **Email**: parent@example.com
- **Password**: parent123
- **Fitur**: Top up saldo anak

## 🗄️ Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Create migration
npm run db:migrate

# Open Prisma Studio
npm run db:studio

# Seed database
npm run db:seed
```

## 💡 Catatan Teknis

- **Top Up Manual oleh Admin**: Setiap top up manual oleh admin akan membuat record baru di tabel `top_ups` dengan status APPROVED, method CASH, dan approvedBy diisi dengan adminId (bukan userId).
- **Sumber Top Up di Riwayat**: Pada riwayat top up siswa dan orang tua, akan tampil label "Top up oleh Admin" jika parentId kosong dan approvedBy terisi, atau "Top up oleh Orang Tua" jika parentId ada.
- **Constraint Database**: Field `approvedBy` pada tabel `top_ups` adalah foreign key ke tabel `admins`, bukan ke tabel `users`.

## 📁 Project Structure

```
pos_kantin/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts           # Seed data
├── src/
│   ├── app/
│   │   ├── api/          # API routes
│   │   └── page.tsx      # Landing page
│   ├── components/
│   │   ├── ui/           # UI components
│   │   ├── AdminDashboard.tsx
│   │   ├── CashierDashboard.tsx
│   │   ├── StudentDashboard.tsx
│   │   ├── ParentDashboard.tsx
│   │   └── LoginModal.tsx
│   └── lib/
│       ├── auth.ts       # Authentication utilities
│       └── db.ts         # Database client
├── lib/
│   └── utils.ts          # Utility functions
└── package.json
```

- **ParentDashboard**: Riwayat top up & transaksi anak kini digabung dalam satu card dengan tabs, dan fitur "Lihat Semua Riwayat" untuk menampilkan seluruh data.
- **StudentDashboard**: Riwayat top up menampilkan sumber top up (admin/orang tua) secara jelas.

## 🎨 Design System

### Color Scheme:

- **Primary**: Emerald (Dark Green) - #047857
- **Secondary**: Ivory White - #FAFAFA
- **Accent**: Yellow - #F59E0B

### Components:

- Modern, clean design
- Responsive layout
- Glassmorphism effects
- Hover animations
- Consistent spacing

## 🔐 Security Features

- Password hashing dengan bcryptjs
- JWT token authentication
- Role-based access control
- Input validation
- SQL injection protection (Prisma)

## 📈 Performance

- Server-side rendering dengan Next.js
- Optimized images
- Code splitting
- Database indexing
- Caching strategies

## 🧪 Testing

```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect repository to Vercel
2. Set environment variables
3. Deploy automatically

### Manual Deployment

1. Build application: `npm run build`
2. Start production: `npm start`
3. Setup PostgreSQL database
4. Run migrations: `npm run db:migrate`

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

Untuk bantuan dan pertanyaan:

- Email: support@poskantin.com
- Documentation: [docs.poskantin.com](https://docs.poskantin.com)
- Issues: [GitHub Issues](https://github.com/username/pos_kantin/issues)
