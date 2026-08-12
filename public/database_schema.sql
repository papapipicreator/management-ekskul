-- Database Schema for Ekstrakurikuler Panahan
-- Import file ini melalui phpMyAdmin atau MySQL CLI di Shared Hosting Anda.

CREATE DATABASE IF NOT EXISTS `db_panahan` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `db_panahan`;

-- 1. Table Schools (Sekolah)
CREATE TABLE IF NOT EXISTS `schools` (
  `id` VARCHAR(100) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `address` TEXT,
  `contactPerson` VARCHAR(150),
  `phone` VARCHAR(50),
  `activeStudentsCount` INT DEFAULT 0,
  `monthlyFeePerStudent` DECIMAL(12,2) DEFAULT 0,
  `coachHonorPerSession` DECIMAL(12,2) DEFAULT 0,
  `financialModel` VARCHAR(50) DEFAULT 'monthly_fee',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Table Students (Siswa)
CREATE TABLE IF NOT EXISTS `students` (
  `id` VARCHAR(100) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `nisn` VARCHAR(50),
  `schoolId` VARCHAR(100) NOT NULL,
  `schoolName` VARCHAR(255),
  `grade` VARCHAR(100),
  `parentName` VARCHAR(150),
  `parentPhone` VARCHAR(50),
  `bowType` VARCHAR(100),
  `targetDistance` VARCHAR(50),
  `qrCodeUrl` TEXT,
  `joinDate` VARCHAR(50),
  `status` VARCHAR(50) DEFAULT 'Aktif',
  `avatarUrl` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (`schoolId`),
  INDEX (`nisn`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Table Coaches (Pelatih)
CREATE TABLE IF NOT EXISTS `coaches` (
  `id` VARCHAR(100) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50),
  `specialization` VARCHAR(150),
  `assignedSchoolIds` JSON,
  `status` VARCHAR(50) DEFAULT 'Aktif',
  `avatarUrl` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Table Schedules (Jadwal Latihan)
CREATE TABLE IF NOT EXISTS `schedules` (
  `id` VARCHAR(100) PRIMARY KEY,
  `schoolId` VARCHAR(100) NOT NULL,
  `schoolName` VARCHAR(255),
  `day` VARCHAR(50),
  `time` VARCHAR(50),
  `coachId` VARCHAR(100),
  `coachName` VARCHAR(255),
  `location` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (`schoolId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Table Student Attendance (Presensi Siswa)
CREATE TABLE IF NOT EXISTS `student_attendance` (
  `id` VARCHAR(100) PRIMARY KEY,
  `studentId` VARCHAR(100) NOT NULL,
  `studentName` VARCHAR(255),
  `schoolId` VARCHAR(100) NOT NULL,
  `schoolName` VARCHAR(255),
  `date` VARCHAR(50) NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `scheduleId` VARCHAR(100),
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (`schoolId`),
  INDEX (`studentId`),
  INDEX (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Table Coach Attendance (Presensi Pelatih)
CREATE TABLE IF NOT EXISTS `coach_attendance` (
  `id` VARCHAR(100) PRIMARY KEY,
  `coachId` VARCHAR(100) NOT NULL,
  `coachName` VARCHAR(255),
  `schoolId` VARCHAR(100) NOT NULL,
  `schoolName` VARCHAR(255),
  `date` VARCHAR(50) NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `scheduleId` VARCHAR(100),
  `sessionHonor` DECIMAL(12,2) DEFAULT 0,
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (`coachId`),
  INDEX (`schoolId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Table Scores (Skor Panahan)
CREATE TABLE IF NOT EXISTS `scores` (
  `id` VARCHAR(100) PRIMARY KEY,
  `studentId` VARCHAR(100) NOT NULL,
  `studentName` VARCHAR(255),
  `schoolId` VARCHAR(100) NOT NULL,
  `schoolName` VARCHAR(255),
  `date` VARCHAR(50) NOT NULL,
  `distance` VARCHAR(50),
  `arrowCount` INT DEFAULT 30,
  `totalScore` INT DEFAULT 0,
  `category` VARCHAR(100),
  `ends` JSON,
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (`studentId`),
  INDEX (`schoolId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Table Payments (Pembayaran SPP / Iuran)
CREATE TABLE IF NOT EXISTS `payments` (
  `id` VARCHAR(100) PRIMARY KEY,
  `studentId` VARCHAR(100) NOT NULL,
  `studentName` VARCHAR(255),
  `schoolId` VARCHAR(100) NOT NULL,
  `schoolName` VARCHAR(255),
  `month` VARCHAR(50) NOT NULL,
  `year` INT NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `paymentDate` VARCHAR(50),
  `paymentMethod` VARCHAR(100),
  `proofUrl` TEXT,
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (`studentId`),
  INDEX (`schoolId`),
  INDEX (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Table Notifications (Pengumuman & Notifikasi)
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` VARCHAR(100) PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `timestamp` VARCHAR(100),
  `type` VARCHAR(50) DEFAULT 'info',
  `targetSchoolId` VARCHAR(100) DEFAULT 'ALL',
  `read` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Table Users (Akun Pengguna)
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(100) PRIMARY KEY,
  `username` VARCHAR(100) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL,
  `assignedSchoolIds` JSON,
  `associatedStudentId` VARCHAR(100),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Table Settings (Pengaturan Rekening & Kredensial)
CREATE TABLE IF NOT EXISTS `settings` (
  `key` VARCHAR(100) PRIMARY KEY,
  `value` JSON NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
