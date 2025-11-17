# CẤU TRÚC DỰ ÁN - NESTJS + PRISMA + NEXT.JS

## 📁 Cấu trúc thư mục

```
batdongsan/
├── backend/                          # NestJS Backend
│   ├── src/
│   │   ├── main.ts                   # Entry point
│   │   ├── app.module.ts             # Root module
│   │   │
│   │   ├── auth/                     # Authentication Module
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── local.strategy.ts
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   └── roles.guard.ts
│   │   │   └── decorators/
│   │   │       ├── current-user.decorator.ts
│   │   │       └── roles.decorator.ts
│   │   │
│   │   ├── properties/               # Property Module
│   │   │   ├── properties.module.ts
│   │   │   ├── properties.controller.ts
│   │   │   ├── properties.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-property.dto.ts
│   │   │   │   ├── update-property.dto.ts
│   │   │   │   └── search-property.dto.ts
│   │   │   └── entities/
│   │   │       └── property.entity.ts
│   │   │
│   │   ├── news/                     # News Module
│   │   │   ├── news.module.ts
│   │   │   ├── news.controller.ts
│   │   │   ├── news.service.ts
│   │   │   └── dto/
│   │   │       ├── create-news.dto.ts
│   │   │       └── update-news.dto.ts
│   │   │
│   │   ├── locations/                # Location Module
│   │   │   ├── locations.module.ts
│   │   │   ├── locations.controller.ts
│   │   │   └── locations.service.ts
│   │   │
│   │   ├── upload/                   # File Upload Module
│   │   │   ├── upload.module.ts
│   │   │   ├── upload.controller.ts
│   │   │   └── upload.service.ts
│   │   │
│   │   ├── prisma/                   # Prisma Service
│   │   │   └── prisma.service.ts
│   │   │
│   │   └── common/                   # Shared Modules
│   │       ├── filters/
│   │       │   └── http-exception.filter.ts
│   │       ├── interceptors/
│   │       │   └── transform.interceptor.ts
│   │       ├── pipes/
│   │       │   └── validation.pipe.ts
│   │       └── decorators/
│   │
│   ├── prisma/
│   │   ├── schema.prisma             # Prisma schema
│   │   ├── migrations/               # Database migrations
│   │   └── seed.ts                   # Seed data
│   │
│   ├── test/                         # E2E tests
│   ├── .env                          # Environment variables
│   ├── .env.example
│   ├── nest-cli.json
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/                         # Next.js Frontend
│   ├── app/                          # Next.js 14 App Router
│   │   ├── layout.tsx                 # Root layout
│   │   ├── page.tsx                   # Homepage
│   │   ├── globals.css                # Global styles (Tailwind)
│   │   │
│   │   ├── (auth)/                    # Auth routes group
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   │
│   │   ├── properties/                # Property pages
│   │   │   ├── page.tsx               # List/Search page
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx           # Detail page
│   │   │   └── create/
│   │   │       └── page.tsx           # Create property
│   │   │
│   │   ├── news/                      # News pages
│   │   │   ├── page.tsx               # News list
│   │   │   └── [slug]/
│   │   │       └── page.tsx           # News detail
│   │   │
│   │   └── api/                       # API routes (optional)
│   │       └── ...
│   │
│   ├── components/                    # React Components
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Navbar.tsx
│   │   │
│   │   ├── properties/
│   │   │   ├── PropertyCard.tsx
│   │   │   ├── PropertyList.tsx
│   │   │   ├── PropertyDetail.tsx
│   │   │   ├── PropertyForm.tsx
│   │   │   └── SearchFilters.tsx
│   │   │
│   │   ├── news/
│   │   │   ├── NewsCard.tsx
│   │   │   └── NewsList.tsx
│   │   │
│   │   ├── ui/                        # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── ...
│   │   │
│   │   └── forms/
│   │       └── ...
│   │
│   ├── lib/                           # Utilities
│   │   ├── api/
│   │   │   ├── client.ts              # API client (axios/fetch)
│   │   │   ├── properties.ts
│   │   │   ├── news.ts
│   │   │   └── auth.ts
│   │   ├── utils/
│   │   │   ├── format.ts              # Format price, area, etc.
│   │   │   └── validation.ts
│   │   └── constants/
│   │       ├── property-types.ts
│   │       └── directions.ts
│   │
│   ├── hooks/                         # Custom React Hooks
│   │   ├── useAuth.ts
│   │   ├── useProperties.ts
│   │   ├── useSearch.ts
│   │   └── useDebounce.ts
│   │
│   ├── types/                         # TypeScript Types
│   │   ├── property.ts
│   │   ├── news.ts
│   │   ├── user.ts
│   │   └── api.ts
│   │
│   ├── store/                         # State Management (Zustand)
│   │   ├── authStore.ts
│   │   └── searchStore.ts
│   │
│   ├── public/                        # Static files
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── .env.local                     # Environment variables
│   ├── .env.example
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── prisma/                            # Shared Prisma (optional)
│   └── schema.prisma
│
├── docs/                              # Documentation
│   ├── THIET_KE_HE_THONG.md
│   ├── SO_DO_LUONG.md
│   └── CAU_TRUC_DU_AN.md
│
└── README.md
```

## 🔧 Cấu hình Backend (NestJS)

### Dependencies chính

```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@prisma/client": "^5.0.0",
    "prisma": "^5.0.0",
    "passport": "^0.6.0",
    "passport-jwt": "^4.0.1",
    "passport-local": "^1.0.0",
    "bcrypt": "^5.1.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "multer": "^1.4.5",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/express": "^4.17.17",
    "@types/node": "^20.0.0",
    "@types/passport-jwt": "^3.0.9",
    "@types/passport-local": "^1.0.35",
    "@types/bcrypt": "^5.0.0",
    "@types/multer": "^1.4.7",
    "typescript": "^5.0.0"
  }
}
```

### Prisma Service

```typescript
// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

### Environment Variables (.env)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/batdongsan?schema=public"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV=development

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DEST="./uploads"

# CORS
CORS_ORIGIN="http://localhost:3001"
```

## 🎨 Cấu hình Frontend (Next.js)

### Dependencies chính

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "axios": "^1.6.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "zustand": "^4.4.0",
    "@tanstack/react-query": "^5.0.0",
    "react-dropzone": "^14.2.0",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0"
  }
}
```

### Tailwind Config

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
      },
    },
  },
  plugins: [],
}
```

### Environment Variables (.env.local)

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Google Maps (optional)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-api-key
```

## 📦 Module Structure (NestJS)

### Property Module Example

```typescript
// properties/properties.module.ts
import { Module } from '@nestjs/common';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PropertiesController],
  providers: [PropertiesService],
  exports: [PropertiesService],
})
export class PropertiesModule {}
```

### DTO Example

```typescript
// properties/dto/create-property.dto.ts
import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { PropertyType, PropertyPurpose } from '@prisma/client';

export class CreatePropertyDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(PropertyType)
  type: PropertyType;

  @IsEnum(PropertyPurpose)
  purpose: PropertyPurpose;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  area: number;

  // ... other fields
}
```

## 🎯 Component Structure (Next.js)

### Property Card Component

```typescript
// components/properties/PropertyCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Property } from '@/types/property';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Link href={`/properties/${property.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <Image
          src={property.images[0]?.imageUrl || '/placeholder.jpg'}
          alt={property.title}
          width={400}
          height={250}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2">{property.title}</h3>
          <p className="text-primary-600 font-bold text-xl">
            {formatPrice(property.price)} {property.purpose === 'SALE' ? '' : '/tháng'}
          </p>
          <p className="text-gray-600 text-sm mt-1">
            {property.area} m² • {property.bedrooms} phòng ngủ
          </p>
          <p className="text-gray-500 text-sm mt-1">
            {property.district}, {property.province}
          </p>
        </div>
      </div>
    </Link>
  );
}
```

## 🔄 API Client Structure

```typescript
// lib/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

```typescript
// lib/api/properties.ts
import apiClient from './client';
import { Property, SearchParams } from '@/types/property';

export const propertiesApi = {
  getAll: (params?: SearchParams) => 
    apiClient.get('/properties', { params }),
  
  getById: (id: number) => 
    apiClient.get(`/properties/${id}`),
  
  create: (data: FormData) => 
    apiClient.post('/properties', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  update: (id: number, data: FormData) => 
    apiClient.put(`/properties/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  delete: (id: number) => 
    apiClient.delete(`/properties/${id}`),
  
  search: (params: SearchParams) => 
    apiClient.post('/properties/search', params),
};
```

## 🚀 Scripts

### Backend (package.json)

```json
{
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "prisma:seed": "ts-node prisma/seed.ts"
  }
}
```

### Frontend (package.json)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

## 📝 Notes

- **Prisma**: Schema được định nghĩa trong `prisma/schema.prisma`, chạy `prisma generate` sau khi thay đổi
- **NestJS**: Sử dụng decorators và dependency injection
- **Next.js**: Sử dụng App Router (Next.js 14+), Server Components mặc định
- **Tailwind**: Utility-first CSS, tùy chỉnh trong `tailwind.config.js`
- **TypeScript**: Strict mode được khuyến nghị cho cả backend và frontend

