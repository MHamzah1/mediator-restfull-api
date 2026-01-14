import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  IsEnum,
  Min,
} from 'class-validator';
import { PaymentMethod } from '../../entities/boost-transaction.entity';

export class CreateBoostOrderDto {
  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Package ID (opsional jika pakai custom)',
  })
  @IsOptional()
  @IsUUID()
  packageId?: string;

  @ApiPropertyOptional({
    example: 50000,
    description: 'Custom budget dalam IDR (jika tidak pakai package)',
  })
  @IsOptional()
  @IsNumber()
  @Min(10000)
  customBudget?: number;

  @ApiPropertyOptional({
    example: 5,
    description: 'Custom duration days (jika tidak pakai package)',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  customDurationDays?: number;

  @ApiProperty({
    example: 'ewallet',
    description: 'Payment method',
    enum: PaymentMethod,
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
