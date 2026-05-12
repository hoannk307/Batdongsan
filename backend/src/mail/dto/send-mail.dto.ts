import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendMailDto {
  /** Email người nhận (lấy từ userData của chủ bất động sản) */
  @ApiProperty({ example: 'owner@example.com' })
  @IsEmail()
  @IsNotEmpty()
  toEmail: string;

  /** Họ tên người gửi (từ form) */
  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsString()
  @IsNotEmpty()
  senderName: string;

  /** Email người gửi (từ form) */
  @ApiProperty({ example: 'sender@example.com' })
  @IsEmail()
  @IsNotEmpty()
  senderEmail: string;

  /** Số điện thoại người gửi (từ form) */
  @ApiPropertyOptional({ example: '0912345678' })
  @IsString()
  @IsOptional()
  senderPhone?: string;

  /** Nội dung tin nhắn (từ form) */
  @ApiPropertyOptional({ example: 'Tôi muốn tìm hiểu thêm về bất động sản này.' })
  @IsString()
  @IsOptional()
  message?: string;

  /** Tiêu đề bất động sản (từ singleData) */
  @ApiPropertyOptional({ example: 'Căn hộ cao cấp Quận 1' })
  @IsString()
  @IsOptional()
  propertyTitle?: string;

  /** ID bất động sản (từ singleData) */
  @ApiPropertyOptional({ example: '42' })
  @IsString()
  @IsOptional()
  propertyId?: string;

  /** Địa chỉ bất động sản (từ singleData) */
  @ApiPropertyOptional({ example: 'Số 10, Đường Lê Lợi, Quận 1, TP.HCM' })
  @IsString()
  @IsOptional()
  propertyAddress?: string;
}
