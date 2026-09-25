-- ======================================================================
-- Mahardika Institute of Technology, Inc. (MIT)
-- Web-Based Employee Payroll Management System - Database Schema
-- File: database.sql
-- ======================================================================

CREATE DATABASE IF NOT EXISTS `mit_payroll_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `mit_payroll_db`;

-- --------------------------------------------------------
-- Table structure for `employees`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `payroll`;
DROP TABLE IF EXISTS `employees`;

CREATE TABLE `employees` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `position` VARCHAR(100) NOT NULL,
  `department` VARCHAR(100) NOT NULL,
  `contact` VARCHAR(30) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `salary_rate` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `role` ENUM('admin', 'employee') NOT NULL DEFAULT 'employee',
  `profile_pic` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `payroll`
-- --------------------------------------------------------
CREATE TABLE `payroll` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `employee_id` VARCHAR(50) NOT NULL,
  `basic_salary` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `allowance` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `absences` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `cash_advances` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `sss` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `phic` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `pagibig` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `loan_sss` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `loan_pagibig` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `wedding_contribution` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `death_contribution` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `gross_pay` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total_deduction` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `net_pay` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `payroll_date` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_payroll_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Seed Initial Data
-- Default Admin: Admin001 / admin123
-- --------------------------------------------------------

INSERT INTO `employees` (`id`, `name`, `position`, `department`, `contact`, `email`, `password`, `salary_rate`, `role`, `profile_pic`) VALUES
('Admin001', 'Farida A. Madjilon', 'Chief Finance Officer / Cashier', 'Finance & HR', '09171234567', 'admin@mit.edu.ph', 'admin123', 65000.00, 'admin', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'),
('EMP-2026-001', 'Juan Carlos Dela Cruz', 'Senior IT Instructor', 'College of Computer Studies', '09182345678', 'j.delacruz@mit.edu.ph', 'employee123', 38500.00, 'employee', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
('EMP-2026-002', 'Maria Santos Reyes', 'Assistant Professor', 'College of Education', '09193456789', 'm.reyes@mit.edu.ph', 'employee123', 32000.00, 'employee', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'),
('EMP-2026-003', 'Ahmad Rizal Alih', 'Laboratory Administrator', 'Information Technology', '09204567890', 'a.rizal@mit.edu.ph', 'employee123', 26500.00, 'employee', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150');

-- Initial Payroll Records
INSERT INTO `payroll` (`employee_id`, `basic_salary`, `allowance`, `absences`, `cash_advances`, `sss`, `phic`, `pagibig`, `loan_sss`, `loan_pagibig`, `wedding_contribution`, `death_contribution`, `gross_pay`, `total_deduction`, `net_pay`, `payroll_date`) VALUES
('EMP-2026-001', 38500.00, 3500.00, 350.00, 1000.00, 360.00, 250.00, 200.00, 500.00, 300.00, 100.00, 100.00, 42000.00, 3160.00, 38840.00, '2026-07-15'),
('EMP-2026-002', 32000.00, 2500.00, 0.00, 0.00, 360.00, 250.00, 200.00, 0.00, 0.00, 100.00, 100.00, 34500.00, 1010.00, 33490.00, '2026-07-15'),
('EMP-2026-003', 26500.00, 2000.00, 700.00, 500.00, 360.00, 250.00, 200.00, 0.00, 0.00, 100.00, 100.00, 28500.00, 2210.00, 26290.00, '2026-07-15');
