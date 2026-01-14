import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
} from '@nestjs/swagger';
import { BoostTransactionService } from './boost-transaction.service';
import { PaymentWebhookDto } from './dto';
import * as crypto from 'crypto';

@ApiTags('Boost Webhooks')
@Controller('api/boost/webhook')
export class BoostWebhookController {
  constructor(
    private readonly boostTransactionService: BoostTransactionService,
  ) {}

  @Post('payment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Payment webhook callback (Payment Gateway)' })
  @ApiHeader({
    name: 'x-signature',
    description: 'Webhook signature for verification',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed',
    schema: {
      example: {
        success: true,
        message: 'Payment processed',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid signature or data' })
  async handlePaymentWebhook(
    @Body() dto: PaymentWebhookDto,
    @Headers('x-signature') signature: string,
  ) {
    // Verify webhook signature
    const isValid = this.verifyWebhookSignature(dto, signature);
    
    if (!isValid) {
      throw new BadRequestException('Invalid webhook signature');
    }

    // Map payment gateway status to our status
    const statusMap: Record<string, string> = {
      'PAID': 'paid',
      'SUCCESS': 'paid',
      'COMPLETED': 'paid',
      'FAILED': 'failed',
      'EXPIRED': 'expired',
      'CANCELLED': 'cancelled',
    };

    const mappedStatus = statusMap[dto.status.toUpperCase()];

    if (mappedStatus === 'paid') {
      return this.boostTransactionService.processPayment(dto.transaction_id, {
        amount: dto.amount,
        paidAt: dto.paid_at,
        paymentMethod: dto.payment_method,
      });
    }

    // Handle other statuses if needed
    return {
      success: true,
      message: `Webhook received with status: ${dto.status}`,
    };
  }

  @Post('payment/simulate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Simulate payment success (Development Only)' })
  @ApiResponse({
    status: 200,
    description: 'Payment simulated',
  })
  async simulatePayment(@Body() body: { paymentReference: string }) {
    // This endpoint is for development/testing only
    // Should be disabled in production
    if (process.env.NODE_ENV === 'production') {
      throw new BadRequestException('This endpoint is disabled in production');
    }

    return this.boostTransactionService.processPayment(body.paymentReference, {
      amount: null, // Will be validated from transaction
      paidAt: new Date().toISOString(),
    });
  }

  private verifyWebhookSignature(payload: PaymentWebhookDto, signature: string): boolean {
    // Skip verification in development if no secret is set
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.warn('PAYMENT_WEBHOOK_SECRET not set, skipping signature verification');
      return true;
    }

    try {
      // Create expected signature
      const payloadString = JSON.stringify({
        transaction_id: payload.transaction_id,
        status: payload.status,
        amount: payload.amount,
      });

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payloadString)
        .digest('hex');

      // Compare signatures using timing-safe comparison
      return crypto.timingSafeEqual(
        Buffer.from(signature || ''),
        Buffer.from(expectedSignature),
      );
    } catch (error) {
      return false;
    }
  }
}
