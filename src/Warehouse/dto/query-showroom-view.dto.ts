import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleStatus } from '../../entities/warehouse-vehicle.entity';
import { ZoneType } from '../../entities/warehouse-zone.entity';

export class QueryShowroomViewDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  perPage?: number = 20;

  @ApiPropertyOptional({
    description: 'Search by brand, model, plate, barcode',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: VehicleStatus,
    description: 'Filter by vehicle status',
  })
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @ApiPropertyOptional({ enum: ZoneType, description: 'Filter by zone type' })
  @IsOptional()
  @IsEnum(ZoneType)
  zoneType?: ZoneType;

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortDirection?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({
    enum: ['createdAt', 'askingPrice', 'year', 'mileage'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';
}
