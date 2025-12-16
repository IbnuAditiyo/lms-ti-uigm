import { AppDataSource } from '../data-source';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../../entities/user.entity';
// Entity lain tetap di-import hanya untuk keperluan penghapusan data (Clean Slate)
import { Course } from '../../entities/course.entity';
import { Assignment } from '../../entities/assignment.entity';
import { CourseMaterial } from '../../entities/course-material.entity';
import { Announcement } from '../../entities/announcement.entity';

async function seed() {
  try {
    console.log('🌱 Starting database seeding (ADMIN ONLY)...');
    
    // Initialize data source
    await AppDataSource.initialize();
    
    const userRepository = AppDataSource.getRepository(User);
    const courseRepository = AppDataSource.getRepository(Course);
    const assignmentRepository = AppDataSource.getRepository(Assignment);
    const materialRepository = AppDataSource.getRepository(CourseMaterial);
    const announcementRepository = AppDataSource.getRepository(Announcement);

    // ==========================================
    // 1. BERSIH-BERSIH DATA LAMA (CLEANUP)
    // ==========================================
    console.log('🧹 Clearing existing data...');
    
    // Hapus data dari tabel "anak" dulu untuk menghindari error foreign key
    await announcementRepository.createQueryBuilder().delete().execute();
    await materialRepository.createQueryBuilder().delete().execute();
    await assignmentRepository.createQueryBuilder().delete().execute();
    
    // Hapus tabel relasi (junction table) manual
    await AppDataSource.query('DELETE FROM course_enrollments');
    
    // Hapus course dan user terakhir
    await courseRepository.createQueryBuilder().delete().execute();
    await userRepository.createQueryBuilder().delete().execute();

    // ==========================================
    // 2. BUAT ADMIN UTAMA (Hanya ini saja)
    // ==========================================
    console.log('👨‍💼 Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = userRepository.create({
      email: 'adminti@uigm.ac.id',
      password: adminPassword,
      fullName: 'Admin Prodi TI',
      role: UserRole.ADMIN,
      isActive: true,
      phone: '08123456789',
      address: 'Universitas Indo Global Mandiri',
    });
    await userRepository.save(admin);

    // ==========================================
    // 3. SELESAI
    // ==========================================
    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Admin: 1 user (Created)`);
    console.log(`- Lecturers: 0 (Deleted/Empty)`);
    console.log(`- Students: 0 (Deleted/Empty)`);
    console.log(`- Courses: 0 (Deleted/Empty)`);
    console.log('\n🔐 Login Credentials:');
    console.log('👉 Admin: adminti@uigm.ac.id / admin123');
    console.log('   (Silakan login Admin untuk membuat data Dosen/Mahasiswa secara manual)');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await AppDataSource.destroy();
    process.exit(0);
  }
}

// Run the seed function
seed();