import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { Public } from '../../../common/decorators/public.decorator.js';
import type { AuthenticatedUser } from '../../../common/interfaces/jwt-payload.interface.js';
import { StoreJwtAuthGuard } from '../auth/guards/store-jwt-auth.guard.js';
import { InitiatePaymentDto, VerifyPaymentDto } from './dto/payment.dto.js';
import { StorePaymentsService } from './store-payments.service.js';

@ApiTags('Store Payments')
@Controller('payments')
export class StorePaymentsController {
  constructor(private readonly paymentsService: StorePaymentsService) {}

  @UseGuards(StoreJwtAuthGuard)
  @ApiBearerAuth()
  @Post('initiate')
  @ApiOperation({ summary: 'Store: Initiate payment session for pending customer order' })
  async initiate(@CurrentUser() user: AuthenticatedUser, @Body() dto: InitiatePaymentDto) {
    return await this.paymentsService.initiatePayment(user, dto);
  }

  @UseGuards(StoreJwtAuthGuard)
  @ApiBearerAuth()
  @Post('verify')
  @ApiOperation({ summary: 'Store: Verify payment signature and confirm customer order' })
  async verify(@CurrentUser() user: AuthenticatedUser, @Body() dto: VerifyPaymentDto) {
    return await this.paymentsService.verifyPayment(user, dto);
  }

  @Public()
  @Post('webhook/razorpay')
  @ApiOperation({ summary: 'Store: Razorpay webhook callback' })
  async handleRazorpayWebhook(
    @Headers('x-razorpay-event-id') eventId: string,
    @Body() payload: Record<string, unknown>,
  ) {
    const id = eventId || (payload['event_id'] as string) || `rzp-${Date.now()}`;
    const type = (payload['event'] as string) || 'payment.authorized';
    return await this.paymentsService.handleWebhook('RAZORPAY', id, type, payload);
  }
}
