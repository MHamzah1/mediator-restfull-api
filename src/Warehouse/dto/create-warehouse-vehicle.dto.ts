import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWarehouseVehicleDto {
  @ApiProperty() @IsNotEmpty() @IsString() showroomId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() carModelId?: string;
  @ApiProperty({ example: 'Toyota' }) @IsNotEmpty() @IsString() brandName: string;
  @ApiProperty({ example: 'Avanza 1.5 G' }) @IsNotEmpty() @IsString() modelName: string;
  @ApiProperty({ example: 2022 }) @IsNotEmpty() @IsNumber() year: number;
  @ApiProperty({ example: 'Hitam' }) @IsNotEmpty() @IsString() color: string;
  @ApiProperty({ example: 'B 1234 ABC' }) @IsNotEmpty() @IsString() licensePlate: string;
  @ApiProperty({ example: 'MHKA6GJ3J1J012345' }) @IsNotEmpty() @IsString() chassisNumber: string;
  @ApiProperty({ example: '2NR-U123456' }) @IsNotEmpty() @IsString() engineNumber: string;
  @ApiProperty({ example: 45000 }) @IsNotEmpty() @IsNumber() mileage: number;
  @ApiProperty({ example: 'automatic' }) @IsNotEmpty() @IsString() transmission: string;
  @ApiProperty({ example: 'bensin' }) @IsNotEmpty() @IsString() fuelType: string;
  @ApiProperty({ example: 230000000 }) @IsNotEmpty() @IsNumber() askingPrice: number;
  @ApiProperty({ example: 'John Doe' }) @IsNotEmpty() @IsString() sellerName: string;
  @ApiProperty({ example: '081234567890' }) @IsNotEmpty() @IsString() sellerPhone: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sellerKtp?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
