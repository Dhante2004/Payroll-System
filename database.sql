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
('Admin001', 'Farida A. Madjilon', 'Chief Finance Officer / Cashier', 'Finance & HR', '09171234567', 'admin@mit.edu.ph', 'admin123', 65000.00, 'admin', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150');

