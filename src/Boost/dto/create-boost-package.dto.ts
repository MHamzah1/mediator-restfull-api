import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateBoostPackageDto {
  @ApiProperty({
    example: 'Standard',
    description: 'Nama paket boost',
  })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 34000,
    description: 'Harga paket dalam IDR',
  })
  @IsNumber()
  @Min(1000)
  price: number;

  @ApiProperty({
    example: 3,
    description: 'Durasi boost dalam hari',
  })
  @IsNumber()
  @Min(1)
  durationDays: number;

  @ApiProperty({
    example: 12289,
    description: 'Estimasi reach minimum',
  })
  @IsNumber()
  @Min(0)
  estimatedReachMin: number;

  @ApiProperty({
    example: 35514,
    description: 'Estimasi reach maximum',
  })
  @IsNumber()
  @Min(0)
  estimatedReachMax: number;

  @ApiPropertyOptional({
    example: 20,
    description: 'Priority score untuk sorting',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priorityScore?: number;

  @ApiPropertyOptional({
    example: 'Paket standard untuk jangkauan menengah',
    description: 'Deskripsi paket',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Status aktif paket',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: 1,
    description: 'Urutan tampilan',
  })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
