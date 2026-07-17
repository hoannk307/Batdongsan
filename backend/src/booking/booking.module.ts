import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { SourcesController } from './sources.controller';
import { SourcesService } from './sources.service';
import { RevenueController } from './revenue.controller';
import { RevenueService } from './revenue.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { FileModule } from '../file/file.module';

@Module({
  imports: [PrismaModule, AuthModule, FileModule],
  controllers: [BookingController, RoomsController, SourcesController, RevenueController],
  providers: [BookingService, RoomsService, SourcesService, RevenueService],
  exports: [BookingService, RoomsService, SourcesService, RevenueService],
})
export class BookingModule {}
