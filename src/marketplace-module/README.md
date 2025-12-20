# Marketplace Module - NestJS

Module lengkap untuk Marketplace Mobil User-to-User dengan integrasi WhatsApp.

## 📁 Struktur File

```
marketplace-module/
├── entities/
│   ├── listing.entity.ts          # Entity untuk listing mobil
│   └── user.entity.ts              # Updated User entity dengan WhatsApp
├── dto/
│   ├── create-listing.dto.ts      # DTO untuk create listing
│   ├── update-listing.dto.ts      # DTO untuk update listing
│   └── filter-listing.dto.ts      # DTO untuk filter/pagination
├── marketplace.service.ts          # Service dengan business logic
├── marketplace.controller.ts       # Controller dengan semua endpoints
└── marketplace.module.ts           # Module definition
```

## 🚀 Cara Install

### 1. Copy Files ke Project Anda

```bash
# Copy semua file ke src/marketplace/
cp -r marketplace-module/* /path/to/your-project/src/marketplace/

# Atau manual:
# - Copy entities/ ke src/entities/
# - Copy dto/ ke src/marketplace/dto/
# - Copy service, controller, module ke src/marketplace/
```

### 2. Update App Module

Edit `src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { BrandModule } from './Brand/brand.module';
import { CarModelModule } from './CarModel/car-model.module';
import { MarketplaceModule } from './marketplace/marketplace.module'; // ← TAMBAHKAN INI
import { User } from './entities/user.entity';
import { Brand } from './entities/brand.entity';
import { CarModel } from './entities/car-model.entity';
import { Listing } from './entities/listing.entity'; // ← TAMBAHKAN INI

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [User, Brand, CarModel, Listing], // ← TAMBAHKAN Listing
      synchronize: true, // Set false di production
    }),
    AuthModule,
    BrandModule,
    CarModelModule,
    MarketplaceModule, // ← TAMBAHKAN INI
  ],
})
export class AppModule {}
```

### 3. Update User Entity

Replace file `src/entities/user.entity.ts` dengan file yang sudah disediakan, atau tambahkan field berikut:

```typescript
@Column({ nullable: true })
whatsappNumber: string;

@Column({ nullable: true })
location: string;
```

### 4. Database Migration (Jika menggunakan TypeORM Migration)

Jika Anda **TIDAK** menggunakan `synchronize: true`, buat migration:

```bash
# Generate migration
npm run typeorm migration:generate -- -n AddListingTable

# Run migration
npm run typeorm migration:run
```

### 5. Update Auth Register (Optional tapi Recommended)

Edit `src/auth/dto/register.dto.ts`:

```typescript
import { IsNotEmpty, IsString, IsOptional, IsEmail, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ example: '081234567890' })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  // ← TAMBAHKAN DUA FIELD INI
  @ApiPropertyOptional({ example: '6281234567890' })
  @IsOptional()
  @IsString()
  @Matches(/^628\d{8,13}$/, {
    message: 'Format nomor WhatsApp tidak valid (harus 628xxxxxxxxx)',
  })
  whatsappNumber?: string;

  @ApiPropertyOptional({ example: 'Jakarta Selatan' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: 'customer', default: 'customer' })
  @IsOptional()
  @IsString()
  role?: string;
}
```

### 6. Test API

Restart aplikasi dan test endpoints:

```bash
npm run start:dev
```

Buka Swagger UI di: `http://localhost:3000/api/docs`

## 📋 Endpoints Yang Tersedia

### **Public Endpoints (Tanpa Auth)**

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/marketplace/listings` | Browse semua listing dengan filter |
| GET | `/api/marketplace/listings/:id` | Detail listing (auto increment view) |
| GET | `/api/marketplace/listings/:id/whatsapp` | Generate WhatsApp link (auto increment contact click) |

### **Protected Endpoints (Perlu JWT Token)**

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/marketplace/listings` | Create listing baru |
| GET | `/api/marketplace/listings/my-listings` | Listing milik user yang login |
| PUT | `/api/marketplace/listings/:id` | Update listing (hanya owner) |
| DELETE | `/api/marketplace/listings/:id` | Delete listing (hanya owner) |

## 🧪 Contoh Request

### 1. Create Listing (POST)

```bash
curl -X POST http://localhost:3000/api/marketplace/listings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "carModelId": "uuid-car-model",
    "year": 2020,
    "price": 150000000,
    "mileage": 50000,
    "transmission": "automatic",
    "fuelType": "bensin",
    "color": "Hitam Metalik",
    "locationCity": "Jakarta Selatan",
    "locationProvince": "DKI Jakarta",
    "description": "Mobil terawat, service rutin di dealer resmi. Kondisi istimewa. Interior bersih, eksterior mulus.",
    "condition": "bekas",
    "ownershipStatus": "Tangan Pertama",
    "taxStatus": "Pajak Hidup",
    "images": [
      "https://cdn.example.com/car1-front.jpg",
      "https://cdn.example.com/car1-back.jpg"
    ],
    "sellerWhatsapp": "6281234567890"
  }'
```

### 2. Browse Listings dengan Filter (GET)

```bash
# Filter by brand, price range, transmission
curl "http://localhost:3000/api/marketplace/listings?brandId=uuid-toyota&minPrice=100000000&maxPrice=200000000&transmission=automatic&locationCity=Jakarta&sortBy=price_asc&page=1&perPage=20"
```

### 3. Get WhatsApp Link (GET)

```bash
curl http://localhost:3000/api/marketplace/listings/uuid-listing/whatsapp
```

Response:
```json
{
  "message": "Link WhatsApp berhasil di-generate",
  "whatsappUrl": "https://wa.me/6281234567890?text=Halo%2C%20saya%20tertarik...",
  "sellerPhone": "6281234567890",
  "preFilledMessage": "Halo, saya tertarik dengan mobil Toyota Avanza 2020...",
  "seller": {
    "name": "John Doe",
    "location": "Jakarta Selatan, DKI Jakarta"
  },
  "listing": {
    "id": "uuid",
    "carBrand": "Toyota",
    "carModel": "Avanza",
    "year": 2020,
    "price": 150000000
  }
}
```

### 4. Update Listing (PUT)

```bash
curl -X PUT http://localhost:3000/api/marketplace/listings/uuid-listing \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "price": 145000000,
    "description": "HARGA TURUN! Mobil terawat, service rutin..."
  }'
```

### 5. Get My Listings (GET)

```bash
curl http://localhost:3000/api/marketplace/listings/my-listings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## ✨ Fitur-Fitur

### ✅ **CRUD Lengkap**
- Create listing dengan validasi ketat
- Read dengan filter & pagination advanced
- Update (hanya owner)
- Delete (hanya owner)

### ✅ **Filter Advanced**
- Filter by: brand, model, price range, year range, transmission, fuel type, location, condition
- Filter by date range atau periode preset
- Multiple sorting options
- Pagination

### ✅ **WhatsApp Integration**
- Generate WhatsApp link otomatis
- Pre-filled message dengan detail mobil
- Auto increment contact click counter
- Format nomor WhatsApp tervalidasi

### ✅ **Analytics**
- View count (auto increment saat view detail)
- Contact click count (auto increment saat generate WA link)
- Summary untuk seller dashboard

### ✅ **Security**
- JWT authentication
- Ownership validation (hanya owner bisa update/delete)
- Input validation dengan class-validator
- SQL injection protection dengan TypeORM

### ✅ **Response Messages**
Setiap endpoint mengembalikan message yang jelas:
```json
{
  "message": "Listing berhasil dibuat",
  "data": { ... }
}
```

## 🔧 Konfigurasi

### Environment Variables

Tambahkan di `.env`:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=marketplace_db

JWT_SECRET=your-super-secret-key
JWT_EXPIRATION=3600

PORT=3000
```

### Database Schema

Table `listings` akan dibuat otomatis dengan kolom:
- id (UUID)
- sellerId (UUID FK ke users)
- carModelId (UUID FK ke car_models)
- year, price, mileage, transmission, fuelType, color
- locationCity, locationProvince
- description, condition, ownershipStatus, taxStatus
- images (array)
- sellerWhatsapp
- isActive, viewCount, contactClickCount
- createdAt, updatedAt

## 📊 Database Indexes

Untuk performance, table `listings` sudah dilengkapi dengan indexes pada:
- sellerId
- carModelId
- isActive
- price
- year
- locationCity
- createdAt

## 🐛 Troubleshooting

### Error: "Model mobil tidak ditemukan"
- Pastikan carModelId yang dikirim valid dan exists di database
- Cek apakah car model isActive = true

### Error: "Forbidden - Anda tidak memiliki akses"
- Pastikan user yang login adalah pemilik listing
- Cek JWT token valid

### Error: "Format nomor WhatsApp tidak valid"
- Format harus: 628xxxxxxxxx (contoh: 6281234567890)
- Tidak boleh ada spasi, tanda +, atau karakter lain

### Listing tidak muncul di browse
- Cek isActive = true
- Cek apakah carModel dan brand juga isActive = true

## 📖 Dokumentasi Lengkap

Lihat file PDF: `Spesifikasi_API_Marketplace_Mobil_User_to_User.pdf` untuk dokumentasi lengkap meliputi:
- Parameter detail
- Response examples
- Error handling
- Flow diagrams
- Best practices

## 🎯 Next Steps (Optional)

1. **Image Upload**
   - Implementasi upload image ke S3/Cloudinary
   - Generate thumbnail otomatis

2. **Favorites/Wishlist**
   - User bisa save listing favorit

3. **Search Enhancement**
   - Full-text search dengan PostgreSQL
   - Elasticsearch integration

4. **Email Notifications**
   - Email ke seller saat ada yang klik WhatsApp
   - Email reminder untuk listing yang tidak aktif

5. **Admin Dashboard**
   - Moderasi listing
   - Statistics

## 📝 License

Proprietary - Internal Use Only

## 👨‍💻 Developer

Created for Marketplace Mobil User-to-User Project
