import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync, unlinkSync } from 'fs';

// Interface untuk file yang diupload (kompatibel dengan S3 dan local)
export interface MulterS3File extends Express.Multer.File {
  location: string; // URL file
  key: string; // File path/key
  bucket: string; // Nama bucket (untuk S3) atau folder (untuk local)
}

// Base URL untuk akses file (sesuaikan dengan domain/port server Anda)
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Folder untuk menyimpan file uploads
const UPLOAD_DIR = join(process.cwd(), 'uploads');

// Pastikan folder uploads ada
if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Subfolder untuk listings
const LISTINGS_DIR = join(UPLOAD_DIR, 'listings');
if (!existsSync(LISTINGS_DIR)) {
  mkdirSync(LISTINGS_DIR, { recursive: true });
}

// Subfolder untuk warehouse
const WAREHOUSE_DIR = join(UPLOAD_DIR, 'warehouse');
if (!existsSync(WAREHOUSE_DIR)) {
  mkdirSync(WAREHOUSE_DIR, { recursive: true });
}

// Konfigurasi Multer untuk upload ke local storage
export const multerS3Config = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      // Tentukan folder berdasarkan route
      const isWarehouse = req.originalUrl.includes('/warehouse/');
      const destDir = isWarehouse ? WAREHOUSE_DIR : LISTINGS_DIR;
      cb(null, destDir);
    },
    filename: (req, file, cb) => {
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      const prefix = req.originalUrl.includes('/warehouse/')
        ? 'vehicle'
        : 'listing';
      const filename = `${prefix}-${uniqueSuffix}${ext}`;
      cb(null, filename);
    },
  }),
  fileFilter: (req, file, cb) => {
    // Validasi tipe file
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new BadRequestException(
          'Invalid file type. Only JPG, JPEG, PNG, and WEBP are allowed',
        ),
        false,
      );
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // Max 5MB per file
  },
};

// Helper function untuk menghapus file dari local storage
export async function deleteFromS3(key: string): Promise<void> {
  try {
    const filePath = join(process.cwd(), key);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
}

// Helper function untuk mendapatkan file path dari URL
export function getS3KeyFromUrl(url: string): string {
  // URL format: http://localhost:3000/uploads/listings/filename.jpg
  if (url.startsWith('http')) {
    const urlObj = new URL(url);
    return urlObj.pathname.substring(1); // Remove leading slash
  }
  return url.startsWith('/') ? url.substring(1) : url;
}

// Helper function untuk generate full URL
export function getS3Url(key: string): string {
  return `${BASE_URL}/${key}`;
}

// Helper untuk mengkonversi Express.Multer.File ke MulterS3File format
export function convertToMulterS3File(file: Express.Multer.File): MulterS3File {
  const isWarehouse = file.destination.includes('warehouse');
  const folder = isWarehouse ? 'warehouse' : 'listings';
  const key = `uploads/${folder}/${file.filename}`;

  return {
    ...file,
    location: `/${key}`, // Simpan sebagai relative path tanpa BASE_URL
    key: key,
    bucket: 'local',
  };
}
