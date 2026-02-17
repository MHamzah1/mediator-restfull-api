import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RepairType } from '../../entities/repair-order.entity';

export class CreateRepairDto {
  @ApiProperty() @IsNotEmpty() @IsString() warehouseVehicleId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() assignedToId?: string;
  @ApiProperty({ enum: RepairType }) @IsNotEmpty() @IsEnum(RepairType) repairType: RepairType;
  @ApiProperty({ example: 'Ganti oli, tune up mesin' }) @IsNotEmpty() @IsString() description: string;
  @ApiPropertyOptional({ example: 5000000 }) @IsOptional() @IsNumber() estimatedCost?: number;
}
