import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MailService } from './mail.service';
import { SendMailDto } from './dto/send-mail.dto';

@ApiTags('mail')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  /**
   * POST /api/mail/send
   * Gửi email liên hệ từ khách hàng đến chủ bất động sản.
   */
  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gửi email liên hệ đến chủ bất động sản' })
  async sendContactEmail(@Body() dto: SendMailDto) {
    await this.mailService.sendContactEmail(dto);
    return { success: true, message: 'Email đã được gửi thành công!' };
  }
}
