import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PurchasePaymentType } from '../../entities/purchase-transaction.entity';
import { PaymentMethod } from '../../entities/boost-transaction.entity';

export class CreatePurchaseDto {
  @ApiProperty() @IsNotEmpty() @IsString() warehouseVehicleId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() listingId?: string;
  @ApiProperty({ example: 230000000 })
  @IsNotEmpty()
  @IsNumber()
  totalPrice: number;
  @ApiProperty({ enum: PurchasePaymentType })
  @IsNotEmpty()
  @IsEnum(PurchasePaymentType)
  paymentType: PurchasePaymentType;
  @ApiPropertyOptional() @IsOptional() @IsNumber() downPayment?: number;
  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;
  @ApiProperty({ example: 'Budi Santoso' })
  @IsNotEmpty()
  @IsString()
  buyerName: string;
  @ApiProperty({ example: '081234567890' })
  @IsNotEmpty()
  @IsString()
  buyerPhone: string;
  @ApiPropertyOptional() @IsOptional() @IsString() buyerKtp?: string;
}
