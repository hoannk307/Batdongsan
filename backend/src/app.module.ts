import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PropertiesModule } from './properties/properties.module';
import { NewsModule } from './news/news.module';
import { LocationsModule } from './locations/locations.module';
import { FileModule } from './file/file.module';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';

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
    UsersModule,
    MailModule,
  ],
})
export class AppModule {}

