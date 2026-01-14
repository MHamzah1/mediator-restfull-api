import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsUUID, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import {
  BoostStatus,
  PaymentStatus,
} from '../../entities/boost-transaction.entity';

export class QueryBoostTransactionDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Page number',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Items per page',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  perPage?: number = 10;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Filter by listing ID',
  })
  @IsOptional()
  @IsUUID()
  listingId?: string;

  @ApiPropertyOptional({
    example: 'active',
    description: 'Filter by boost status',
    enum: BoostStatus,
  })
  @IsOptional()
  @IsEnum(BoostStatus)
  status?: BoostStatus;

  @ApiPropertyOptional({
    example: 'paid',
    description: 'Filter by payment status',
    enum: PaymentStatus,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;
}

export class AdminQueryBoostTransactionDto extends QueryBoostTransactionDto {
  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Filter by user ID',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;
}
