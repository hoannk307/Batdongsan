import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PropertiesModule } from './properties/properties.module';
import { NewsModule } from './news/news.module';
import { LocationsModule } from './locations/locations.module';
import { FileModule } from './file/file.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    PropertiesModule,
    NewsModule,
    LocationsModule,
    FileModule,
  ],
})
export class AppModule {}

