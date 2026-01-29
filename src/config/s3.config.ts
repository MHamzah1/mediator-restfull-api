import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { BadRequestException } from '@nestjs/common';
import * as multerS3 from 'multer-s3';
import { extname } from 'path';

// Interface untuk file yang diupload ke S3
export interface MulterS3File extends Express.Multer.File {
  location: string; // URL S3
  key: string; // S3 key
  bucket: string; // Nama bucket
}

// Konfigurasi S3 Client
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// Nama bucket S3
export const S3_BUCKET = process.env.AWS_S3_BUCKET || 'mediator-uploads';

// Konfigurasi Multer untuk upload ke S3
export const multerS3Config = {
  storage: multerS3({
    s3: s3Client,
    bucket: S3_BUCKET,
    acl: 'public-read', // File dapat diakses publik
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      const filename = `listings/listing-${uniqueSuffix}${ext}`;
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

// Helper function untuk menghapus file dari S3
export async function deleteFromS3(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });
    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting from S3:', error);
  }
}

// Helper function untuk mendapatkan S3 key dari URL
export function getS3KeyFromUrl(url: string): string {
  // URL format: https://bucket-name.s3.region.amazonaws.com/listings/filename.jpg
  // atau: /listings/filename.jpg (relative path)
  if (url.startsWith('http')) {
    const urlObj = new URL(url);
    return urlObj.pathname.substring(1); // Remove leading slash
  }
  return url.startsWith('/') ? url.substring(1) : url;
}

// Helper function untuk generate full S3 URL
export function getS3Url(key: string): string {
  const region = process.env.AWS_REGION || 'ap-southeast-1';
  return `https://${S3_BUCKET}.s3.${region}.amazonaws.com/${key}`;
}
