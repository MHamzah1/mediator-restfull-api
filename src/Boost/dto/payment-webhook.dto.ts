import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class PaymentWebhookDto {
  @ApiProperty({
    example: 'PAY-123456',
    description: 'External transaction/payment ID',
  })
  @IsString()
  transaction_id: string;

  @ApiProperty({
    example: 'PAID',
    description: 'Payment status from gateway',
  })
  @IsString()
  status: string;

  @ApiProperty({
    example: 34000,
    description: 'Payment amount',
  })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({
    example: '2026-01-14T10:35:00Z',
    description: 'Payment timestamp',
  })
  @IsOptional()
  @IsDateString()
  paid_at?: string;

  @ApiPropertyOptional({
    example: 'ewallet',
    description: 'Payment method used',
  })
  @IsOptional()
  @IsString()
  payment_method?: string;

  @ApiProperty({
    example: 'sha256-hash...',
    description: 'Webhook signature for verification',
  })
  @IsString()
  signature: string;
}

export class ManualPaymentConfirmDto {
  @ApiProperty({
    example: 'PAY-123456',
    description: 'Payment reference/proof',
  })
  @IsString()
  paymentReference: string;

  @ApiPropertyOptional({
    example: 'Transfer dari BCA a/n John Doe',
    description: 'Notes/keterangan',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
