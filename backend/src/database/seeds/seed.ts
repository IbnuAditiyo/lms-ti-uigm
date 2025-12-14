import { AppDataSource } from '../data-source';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../../entities/user.entity';
import { Course } from '../../entities/course.entity';
import { Assignment, AssignmentType } from '../../entities/assignment.entity';
import { CourseMaterial, MaterialType } from '../../entities/course-material.entity';
import { Announcement, AnnouncementPriority } from '../../entities/announcement.entity';

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Initialize data source
    await AppDataSource.initialize();
    
    const userRepository = AppDataSource.getRepository(User);
    const courseRepository = AppDataSource.getRepository(Course);
    const assignmentRepository = AppDataSource.getRepository(Assignment);
    const materialRepository = AppDataSource.getRepository(CourseMaterial);
    const announcementRepository = AppDataSource.getRepository(Announcement);

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    // Gunakan delete() via QueryBuilder untuk menghapus semua data tanpa error
    await announcementRepository.createQueryBuilder().delete().execute();
    await materialRepository.createQueryBuilder().delete().execute();
    await assignmentRepository.createQueryBuilder().delete().execute();
    
    // Hapus tabel relasi (junction table) manual
    await AppDataSource.query('DELETE FROM course_enrollments');
    
    await courseRepository.createQueryBuilder().delete().execute();
    await userRepository.createQueryBuilder().delete().execute();

    // Create admin user
    console.log('👨‍💼 Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = userRepository.create({
      email: 'adminti@uigm.ac.id',
      password: adminPassword,
      fullName: 'Admin Prodi TI',
      role: UserRole.ADMIN,
      isActive: true,
    });
    await userRepository.save(admin);

    // Create lecturers
    console.log('👨‍🏫 Creating lecturers...');
    const lecturerPassword = await bcrypt.hash('lecturer123', 10);
    
    const lecturer = userRepository.create({
      email: 'rendra@uigm.ac.id',
      password: lecturerPassword,
      fullName: 'Dr. Rendra Gustriansyah, S.T., M.Kom.',
      lecturerId: 'NIDN001',
      role: UserRole.LECTURER,
      phone: '08123456789',
      isActive: true,
    });

    await userRepository.save([lecturer]);

    // Create students
    console.log('👨‍🎓 Creating students...');
    const studentPassword = await bcrypt.hash('student123', 10);
    
    const students = [];
    const studentData = [
      { name: 'Ibnu Aditiyo', nim: '2022110081', email: '2022110081@students.uigm.ac.id' },
    ];

    for (const data of studentData) {
      const student = userRepository.create({
        email: data.email,
        password: studentPassword,
        fullName: data.name,
        studentId: data.nim,
        role: UserRole.STUDENT,
        isActive: true,
      });
      students.push(student);
    }
    await userRepository.save(students);

    // Create courses
    console.log('📚 Creating courses...');
    const course = courseRepository.create({
      code: 'MWP51TI031',
      name: 'Manajemen Proyek Perangkat Lunak',
      description: 'Mata kuliah yang membahas manajemen proyek perangkat lunak.',
      credits: 3,
      semester: '2025/7',
      lecturer: lecturer,
      lecturerId: lecturer.id,
      isActive: true,
    });

    await courseRepository.save([course]);

    // Enroll students to courses
    console.log('📝 Enrolling students to courses...');
    
    // Enroll first 5 students to course1
    course.students = students.slice(0, 5);

    await courseRepository.save([course]);

    // Create course materials
    console.log('📖 Creating course materials...');
    
    const materials = [
      {
        course: course,
        title: 'Pengantar MPPL',
        description: 'Materi pengantar MPPL',
        type: MaterialType.PDF,
        week: 1,
        orderIndex: 1,
        uploadedBy: lecturer,
      },
    ];

    for (const materialData of materials) {
      const material = materialRepository.create({
        ...materialData,
        courseId: materialData.course.id,
        uploadedById: materialData.uploadedBy.id,
      });
      await materialRepository.save(material);
    }

    // Create assignments
    console.log('📋 Creating assignments...');
    
    const assignment = assignmentRepository.create({
      title: 'Tugas 1',
      description: 'Bentuk kelompok, satu kelompok 3 orang lalu tentukan topik proyeknya',
      type: AssignmentType.INDIVIDUAL,
      dueDate: new Date('2025-09-20'),
      maxScore: 100,
      allowedFileTypes: ['py', 'txt'],
      course: course,
      courseId: course.id,
      lecturer: lecturer,
      lecturerId: lecturer.id,
    });

    await assignmentRepository.save([assignment]);

    // Create announcements
    console.log('📢 Creating announcements...');
    
    const announcement = announcementRepository.create({
      title: 'Selamat Datang di Semester Baru!',
      content: 'Selamat datang mahasiswa lama di semester 2025/7. Silakan periksa jadwal kuliah dan materi yang tersedia.',
      priority: AnnouncementPriority.HIGH,
      course: course,
      courseId: course.id,
      author: lecturer,
      authorId: lecturer.id,
    });

    await announcementRepository.save([announcement]);

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Admin: 1 user`);
    console.log(`- Lecturers: 1 users`);
    console.log(`- Students: 1 users`);
    console.log(`- Courses: 1 courses`);
    console.log(`- Materials: 1 materials`);
    console.log(`- Assignments: 1 assignments`);
    console.log(`- Announcements: 1 announcements`);
    console.log('\n🔐 Default credentials:');
    console.log('Admin: adminti@uigm.ac.id / admin123');
    console.log('Lecturer: rendra@uigm.ac.id / lecturer123');
    console.log('Student: 2022110081@students.uigm.ac.id / student123');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await AppDataSource.destroy();
    process.exit(0);
  }
}

// Run the seed function
seed();
