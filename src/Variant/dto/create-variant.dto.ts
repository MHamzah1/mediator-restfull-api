import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsEnum,
  IsInt,
  IsBoolean,
  Min,
  MaxLength,
} from 'class-validator';
import { TransmissionType } from '../../entities/variant.entity';

export class CreateVariantDto {
  @ApiProperty({ example: 'uuid', description: 'Car Model ID' })
  @IsNotEmpty({ message: 'Model ID wajib diisi' })
  @IsUUID('4', { message: 'Model ID harus berupa UUID yang valid' })
  modelId: string;

  @ApiProperty({ example: 'GR Sport', description: 'Nama variant' })
  @IsNotEmpty({ message: 'Nama variant wajib diisi' })
  @IsString()
  @MaxLength(100)
  variantName: string;

  @ApiProperty({ example: 'FTN-GRS', description: 'Kode variant (unique)' })
  @IsNotEmpty({ message: 'Kode variant wajib diisi' })
  @IsString()
  @MaxLength(50)
  variantCode: string;

  @ApiProperty({ example: 'Tipe sport dengan bodykit khusus', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: 'matic', enum: TransmissionType, required: false })
  @IsOptional()
  @IsEnum(TransmissionType)
  transmissionType?: TransmissionType;

  @ApiProperty({ example: 4, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
