import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { SourcesController } from './sources.controller';
import { SourcesService } from './sources.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { FileModule } from '../file/file.module';

@Module({
  imports: [PrismaModule, AuthModule, FileModule],
  controllers: [BookingController, RoomsController, SourcesController],
  providers: [BookingService, RoomsService, SourcesService],
  exports: [BookingService, RoomsService, SourcesService],
})
export class BookingModule {}
