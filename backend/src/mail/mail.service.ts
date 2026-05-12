import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendMailDto } from './dto/send-mail.dto';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    const mailUser = this.config.get<string>('MAIL_USER');
    const mailPass = this.config.get<string>('MAIL_PASS');
    const mailHost = this.config.get<string>('MAIL_HOST', 'smtp.gmail.com');
    // ConfigService.get() trả về string → ép kiểu Number tường minh
    const mailPort = Number(this.config.get('MAIL_PORT') ?? 587);

    this.logger.log(`📧 Khởi tạo SMTP: ${mailHost}:${mailPort} – user: ${mailUser}`);

    this.transporter = nodemailer.createTransport({
      host: mailHost,
      port: mailPort,
      secure: mailPort === 465, // true chỉ khi dùng port 465
      auth: {
        user: mailUser,
        pass: mailPass,
      },
      tls: {
        rejectUnauthorized: false, // bỏ qua lỗi self-signed cert môi trường dev
      },
    });

    // Xác minh kết nối SMTP ngay lúc khởi động để log lỗi sớm
    this.transporter.verify((error) => {
      if (error) {
        this.logger.error('❌ Kết nối SMTP thất bại:', error.message);
      } else {
        this.logger.log('✅ SMTP sẵn sàng gửi email!');
      }
    });
  }

  async sendContactEmail(dto: SendMailDto): Promise<void> {
    const {
      toEmail,
      senderName,
      senderEmail,
      senderPhone,
      message,
      propertyTitle,
      propertyId,
      propertyAddress,
    } = dto;

    const subject = `[Lien he BDS] ${senderName} quan tam den "${propertyTitle || 'bat dong san cua ban'}"`;

    // Plain-text body – bắt buộc để tránh spam filter
    const textBody = [
      '=== THONG TIN LIEN HE MOI ===',
      '',
      `Ho ten  : ${senderName}`,
      `Email   : ${senderEmail}`,
      `SDT     : ${senderPhone || 'Khong cung cap'}`,
      '',
      propertyTitle ? `BDS quan tam: ${propertyTitle}` : '',
      propertyId    ? `Ma BDS     : #${propertyId}` : '',
      propertyAddress ? `Dia chi    : ${propertyAddress}` : '',
      '',
      message ? `Noi dung:\n${message}` : '',
      '',
      '---',
      'Email nay duoc gui tu he thong Bat Dong San.',
    ].filter(Boolean).join('\n');

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 32px;">
          <h2 style="color: #fff; margin: 0; font-size: 22px;">📬 Yêu cầu liên hệ mới</h2>
          <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px;">Ai đó quan tâm đến bất động sản của bạn!</p>
        </div>

        <div style="padding: 28px 32px; background: #ffffff;">
          <h3 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 8px; margin-top: 0;">Thông tin người liên hệ</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td style="padding: 8px 0; color: #666; width: 40%; font-weight: 600;">Họ tên:</td>
              <td style="padding: 8px 0; color: #333;">${senderName}</td>
            </tr>
            <tr style="background: #f9f9f9;">
              <td style="padding: 8px 4px; color: #666; font-weight: 600;">Email:</td>
              <td style="padding: 8px 4px; color: #333;"><a href="mailto:${senderEmail}" style="color: #667eea;">${senderEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: 600;">Số điện thoại:</td>
              <td style="padding: 8px 0; color: #333;">${senderPhone || 'Không cung cấp'}</td>
            </tr>
          </table>

          ${propertyTitle ? `
          <h3 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 8px;">Bất động sản quan tâm</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td style="padding: 8px 0; color: #666; width: 40%; font-weight: 600;">Tên BĐS:</td>
              <td style="padding: 8px 0; color: #333; font-weight: 600;">${propertyTitle}</td>
            </tr>
            ${propertyId ? `<tr style="background: #f9f9f9;"><td style="padding: 8px 4px; color: #666; font-weight: 600;">Mã BĐS:</td><td style="padding: 8px 4px; color: #333;">#${propertyId}</td></tr>` : ''}
            ${propertyAddress ? `<tr><td style="padding: 8px 0; color: #666; font-weight: 600;">Địa chỉ:</td><td style="padding: 8px 0; color: #333;">${propertyAddress}</td></tr>` : ''}
          </table>
          ` : ''}

          ${message ? `
          <h3 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 8px;">Nội dung tin nhắn</h3>
          <div style="background: #f5f5f5; border-left: 4px solid #667eea; padding: 16px; border-radius: 4px; color: #444; line-height: 1.6;">
            ${message.replace(/\n/g, '<br/>')}
          </div>
          ` : ''}
        </div>

        <div style="background: #f0f0f0; padding: 16px 32px; text-align: center;">
          <p style="margin: 0; color: #888; font-size: 12px;">Email này được gửi tự động từ hệ thống Bất Động Sản. Vui lòng không trả lời trực tiếp email này.</p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        // Dùng ASCII trong from-name để tránh spam filter
        from: `"He Thong Bat Dong San" <${this.config.get<string>('MAIL_USER')}>`,
        to: toEmail,
        // replyTo dạng đầy đủ: "Tên" <email> – rõ ràng hơn cho mail server
        replyTo: `"${senderName}" <${senderEmail}>`,
        subject,
        text: textBody,   // plain-text fallback – quan trọng chống spam
        html: htmlBody,
        headers: {
          // Khai báo X-Mailer giúp mail server nhận dạng nguồn gửi hợp lệ
          'X-Mailer': 'BatDongSan-Mailer/1.0',
          // Giảm điểm spam: báo không phải bulk mail
          'Precedence': 'transactional',
        },
      });
      this.logger.log(`✅ Email gửi thành công tới ${toEmail}`);
    } catch (error) {
      this.logger.error(`❌ Gửi email thất bại tới ${toEmail}:`, error);
      throw new InternalServerErrorException('Không thể gửi email. Vui lòng thử lại sau.');
    }
  }
}
