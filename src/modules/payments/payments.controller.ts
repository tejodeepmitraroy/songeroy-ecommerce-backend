import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import type { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface.js';
import type { InitiatePaymentDto, VerifyPaymentDto } from './dto/payment.dto.js';
import { PaymentsService } from './payments.service.js';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('initiate')
  @ApiOperation({ summary: 'Initiate payment session for pending order' })
  async initiate(@CurrentUser() user: AuthenticatedUser, @Body() dto: InitiatePaymentDto) {
    return await this.paymentsService.initiatePayment(user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('verify')
  @ApiOperation({ summary: 'Verify payment signature and confirm order' })
  async verify(@CurrentUser() user: AuthenticatedUser, @Body() dto: VerifyPaymentDto) {
    return await this.paymentsService.verifyPayment(user, dto);
  }

  @Public()
  @Post('webhook/razorpay')
  @ApiOperation({ summary: 'Razorpay webhook callback' })
  async handleRazorpayWebhook(
    @Headers('x-razorpay-event-id') eventId: string,
    @Body() payload: Record<string, unknown>,
  ) {
    const id = eventId || (payload['event_id'] as string) || `rzp-${Date.now()}`;
    const type = (payload['event'] as string) || 'payment.authorized';
    return await this.paymentsService.handleWebhook('RAZORPAY', id, type, payload);
  }
}
