import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static'; // 👈 1. Hapus tanda komentar (uncomment) ini
import { join } from 'path';

// Modules
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { ForumsModule } from './forums/forums.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UploadsModule } from './uploads/uploads.module';
import { HealthModule } from './health/health.module';
import { AdminModule } from './admin/admin.module';

// ✨ NEW: Video-based attendance modules
import { VideoProgressModule } from './video-progress/video-progress.module';
import { AttendanceModule } from './attendance/attendance.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // 👇 2. Hapus tanda komentar pada blok ini untuk mengaktifkan akses file publik
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'), 
      serveRoot: '/uploads',
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    CoursesModule,
    AssignmentsModule,
    ForumsModule,
    AnnouncementsModule,
    NotificationsModule,
    UploadsModule,
    HealthModule,
    AdminModule,
    
    AttendanceModule,
    VideoProgressModule,
  ],
})
export class AppModule {}