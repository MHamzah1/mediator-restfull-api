import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';

// Konfigurasi untuk menyimpan file
export const multerConfig = {
  storage: diskStorage({
    destination: './uploads/listings', // Folder penyimpanan
    filename: (req, file, cb) => {
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      const filename = `listing-${uniqueSuffix}${ext}`;
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
