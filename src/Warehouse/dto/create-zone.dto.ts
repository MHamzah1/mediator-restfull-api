import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ZoneType } from '../../entities/warehouse-zone.entity';

export class CreateZoneDto {
  @ApiProperty() @IsNotEmpty() @IsString() showroomId: string;
  @ApiProperty({ example: 'GD-A' }) @IsNotEmpty() @IsString() code: string;
  @ApiProperty({ example: 'Gudang Ready Jual' })
  @IsNotEmpty()
  @IsString()
  name: string;
  @ApiProperty({ enum: ZoneType })
  @IsNotEmpty()
  @IsEnum(ZoneType)
  type: ZoneType;
  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  capacity?: number;
}
