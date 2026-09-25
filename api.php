<?php
/**
 * Mahardika Institute of Technology, Inc. (MIT)
 * REST API Backend Service
 * File: api.php
 */

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'db.php';

$pdo = Database::getInstance()->getConnection();
$action = isset($_GET['action']) ? $_GET['action'] : '';

$requestData = json_decode(file_get_contents("php://input"), true) ?? $_POST;

try {
    switch ($action) {
        // -------------------------------------------------------------
        // AUTHENTICATION: LOGIN
        // -------------------------------------------------------------
        case 'login':
            $usernameOrEmail = trim($requestData['username'] ?? $requestData['email'] ?? '');
            $password = trim($requestData['password'] ?? '');

            if (empty($usernameOrEmail) || empty($password)) {
                echo json_encode(["status" => "error", "message" => "Please enter username/ID/Email and password."]);
                exit;
            }

            // Hardcoded fallback for default admin if not in DB
            if (($usernameOrEmail === 'Admin001' || $usernameOrEmail === 'admin@mit.edu.ph') && $password === 'admin123') {
                $stmt = $pdo->prepare("SELECT * FROM employees WHERE id = 'Admin001'");
                $stmt->execute();
                $user = $stmt->fetch();
                if (!$user) {
                    $user = [
                        'id' => 'Admin001',
                        'name' => 'Farida A. Madjilon',
                        'position' => 'Chief Finance Officer / Cashier',
                        'department' => 'Finance & HR',
                        'contact' => '09171234567',
                        'email' => 'admin@mit.edu.ph',
                        'salary_rate' => '65000.00',
                        'role' => 'admin',
                        'profile_pic' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
                    ];
                }
                echo json_encode(["status" => "success", "message" => "Admin login successful", "user" => $user]);
                exit;
            }

            $stmt = $pdo->prepare("SELECT * FROM employees WHERE (id = :user OR email = :user)");
            $stmt->execute(['user' => $usernameOrEmail]);
            $user = $stmt->fetch();

            if ($user && ($password === $user['password'] || password_verify($password, $user['password']))) {
                unset($user['password']);
                echo json_encode(["status" => "success", "message" => "Login successful", "user" => $user]);
            } else {
                echo json_encode(["status" => "error", "message" => "Invalid credentials."]);
            }
            break;

        // -------------------------------------------------------------
        // AUTHENTICATION: REGISTER
        // -------------------------------------------------------------
        case 'register':
            $id = trim($requestData['id'] ?? ('EMP-' . date('Y') . '-' . rand(100, 999)));
            $name = trim($requestData['name'] ?? '');
            $email = trim($requestData['email'] ?? '');
            $password = trim($requestData['password'] ?? '');
            $position = trim($requestData['position'] ?? 'Staff Instructor');
            $department = trim($requestData['department'] ?? 'General Education');
            $contact = trim($requestData['contact'] ?? '09170000000');
            $salaryRate = floatval($requestData['salary_rate'] ?? 25000.00);

            if (empty($name) || empty($email) || empty($password)) {
                echo json_encode(["status" => "error", "message" => "Full Name, Email, and Password are required."]);
                exit;
            }

            // Check existing
            $check = $pdo->prepare("SELECT id FROM employees WHERE email = :email OR id = :id");
            $check->execute(['email' => $email, 'id' => $id]);
            if ($check->fetch()) {
                echo json_encode(["status" => "error", "message" => "An employee with this Email or ID already exists."]);
                exit;
            }

            $stmt = $pdo->prepare("INSERT INTO employees (id, name, position, department, contact, email, password, salary_rate, role, profile_pic) VALUES (:id, :name, :position, :department, :contact, :email, :password, :salary_rate, 'employee', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150')");
            $stmt->execute([
                'id' => $id,
                'name' => $name,
                'position' => $position,
                'department' => $department,
                'contact' => $contact,
                'email' => $email,
                'password' => $password,
                'salary_rate' => $salaryRate
            ]);

            echo json_encode(["status" => "success", "message" => "Employee account created successfully! You can now log in.", "employee_id" => $id]);
            break;

        // -------------------------------------------------------------
        // EMPLOYEES CRUD
        // -------------------------------------------------------------
        case 'get_employees':
            $search = trim($_GET['search'] ?? '');
            if (!empty($search)) {
                $stmt = $pdo->prepare("SELECT id, name, position, department, contact, email, salary_rate, role, profile_pic, created_at FROM employees WHERE id LIKE :s OR name LIKE :s OR department LIKE :s OR position LIKE :s ORDER BY name ASC");
                $stmt->execute(['s' => "%$search%"]);
            } else {
                $stmt = $pdo->query("SELECT id, name, position, department, contact, email, salary_rate, role, profile_pic, created_at FROM employees ORDER BY name ASC");
            }
            echo json_encode(["status" => "success", "data" => $stmt->fetchAll()]);
            break;

        case 'add_employee':
            $stmt = $pdo->prepare("INSERT INTO employees (id, name, position, department, contact, email, password, salary_rate, role, profile_pic) VALUES (:id, :name, :position, :department, :contact, :email, :password, :salary_rate, :role, :profile_pic)");
            $stmt->execute([
                'id' => trim($requestData['id']),
                'name' => trim($requestData['name']),
                'position' => trim($requestData['position']),
                'department' => trim($requestData['department']),
                'contact' => trim($requestData['contact']),
                'email' => trim($requestData['email']),
                'password' => trim($requestData['password'] ?? 'employee123'),
                'salary_rate' => floatval($requestData['salary_rate']),
                'role' => $requestData['role'] ?? 'employee',
                'profile_pic' => $requestData['profile_pic'] ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
            ]);
            echo json_encode(["status" => "success", "message" => "Employee added successfully"]);
            break;

        case 'update_employee':
            $stmt = $pdo->prepare("UPDATE employees SET name = :name, position = :position, department = :department, contact = :contact, email = :email, salary_rate = :salary_rate, role = :role WHERE id = :id");
            $stmt->execute([
                'id' => trim($requestData['id']),
                'name' => trim($requestData['name']),
                'position' => trim($requestData['position']),
                'department' => trim($requestData['department']),
                'contact' => trim($requestData['contact']),
                'email' => trim($requestData['email']),
                'salary_rate' => floatval($requestData['salary_rate']),
                'role' => $requestData['role'] ?? 'employee'
            ]);
            echo json_encode(["status" => "success", "message" => "Employee record updated"]);
            break;

        case 'delete_employee':
            $id = $_GET['id'] ?? $requestData['id'] ?? '';
            $stmt = $pdo->prepare("DELETE FROM employees WHERE id = :id");
            $stmt->execute(['id' => $id]);
            echo json_encode(["status" => "success", "message" => "Employee deleted successfully"]);
            break;

        // -------------------------------------------------------------
        // PAYROLL CRUD & CALCULATIONS
        // -------------------------------------------------------------
        case 'get_payroll':
            $empId = $_GET['employee_id'] ?? '';
            if (!empty($empId)) {
                $stmt = $pdo->prepare("SELECT p.*, e.name, e.position, e.department, e.email FROM payroll p JOIN employees e ON p.employee_id = e.id WHERE p.employee_id = :empId ORDER BY p.payroll_date DESC, p.id DESC");
                $stmt->execute(['empId' => $empId]);
            } else {
                $stmt = $pdo->query("SELECT p.*, e.name, e.position, e.department, e.email FROM payroll p JOIN employees e ON p.employee_id = e.id ORDER BY p.payroll_date DESC, p.id DESC");
            }
            echo json_encode(["status" => "success", "data" => $stmt->fetchAll()]);
            break;

        case 'save_payroll':
            $empId = trim($requestData['employee_id']);
            $basicSalary = floatval($requestData['basic_salary']);
            $allowance = floatval($requestData['allowance'] ?? 0);
            $absences = floatval($requestData['absences'] ?? 0);
            $cashAdvances = floatval($requestData['cash_advances'] ?? 0);
            $sss = floatval($requestData['sss'] ?? 360);
            $phic = floatval($requestData['phic'] ?? 250);
            $pagibig = floatval($requestData['pagibig'] ?? 200);
            $loanSss = floatval($requestData['loan_sss'] ?? 0);
            $loanPagibig = floatval($requestData['loan_pagibig'] ?? 0);
            $weddingContrib = floatval($requestData['wedding_contribution'] ?? 0);
            $deathContrib = floatval($requestData['death_contribution'] ?? 0);
            $payrollDate = $requestData['payroll_date'] ?? date('Y-m-d');

            $grossPay = $basicSalary + $allowance;
            $totalDeduction = $absences + $cashAdvances + $sss + $phic + $pagibig + $loanSss + $loanPagibig + $weddingContrib + $deathContrib;
            $netPay = $grossPay - $totalDeduction;

            $stmt = $pdo->prepare("INSERT INTO payroll (employee_id, basic_salary, allowance, absences, cash_advances, sss, phic, pagibig, loan_sss, loan_pagibig, wedding_contribution, death_contribution, gross_pay, total_deduction, net_pay, payroll_date) VALUES (:empId, :basicSalary, :allowance, :absences, :cashAdvances, :sss, :phic, :pagibig, :loanSss, :loanPagibig, :weddingContrib, :deathContrib, :grossPay, :totalDeduction, :netPay, :payrollDate)");
            $stmt->execute([
                'empId' => $empId,
                'basicSalary' => $basicSalary,
                'allowance' => $allowance,
                'absences' => $absences,
                'cashAdvances' => $cashAdvances,
                'sss' => $sss,
                'phic' => $phic,
                'pagibig' => $pagibig,
                'loanSss' => $loanSss,
                'loanPagibig' => $loanPagibig,
                'weddingContrib' => $weddingContrib,
                'deathContrib' => $deathContrib,
                'grossPay' => $grossPay,
                'totalDeduction' => $totalDeduction,
                'netPay' => $netPay,
                'payrollDate' => $payrollDate
            ]);

            echo json_encode(["status" => "success", "message" => "Payroll record processed and saved", "id" => $pdo->lastInsertId()]);
            break;

        case 'delete_payroll':
            $id = $_GET['id'] ?? $requestData['id'] ?? '';
            $stmt = $pdo->prepare("DELETE FROM payroll WHERE id = :id");
            $stmt->execute(['id' => $id]);
            echo json_encode(["status" => "success", "message" => "Payroll record removed"]);
            break;

        // -------------------------------------------------------------
        // DASHBOARD STATS
        // -------------------------------------------------------------
        case 'get_dashboard_stats':
            $countEmp = $pdo->query("SELECT COUNT(*) as total FROM employees WHERE role = 'employee'")->fetch()['total'];
            $countPayslips = $pdo->query("SELECT COUNT(*) as total FROM payroll")->fetch()['total'];
            $sumPayroll = $pdo->query("SELECT SUM(net_pay) as total FROM payroll")->fetch()['total'] ?? 0.00;
            $pendingCount = $pdo->query("SELECT COUNT(*) as total FROM employees e WHERE e.role = 'employee' AND e.id NOT IN (SELECT employee_id FROM payroll WHERE MONTH(payroll_date) = MONTH(CURRENT_DATE()))")->fetch()['total'];

            echo json_encode([
                "status" => "success",
                "data" => [
                    "total_employees" => intval($countEmp),
                    "total_payslips" => intval($countPayslips),
                    "total_payroll_sum" => floatval($sumPayroll),
                    "pending_payroll" => intval($pendingCount)
                ]
            ]);
            break;

        // -------------------------------------------------------------
        // PROFILE & SETTINGS
        // -------------------------------------------------------------
        case 'change_password':
            $empId = $requestData['employee_id'];
            $newPassword = $requestData['new_password'];
            $stmt = $pdo->prepare("UPDATE employees SET password = :p WHERE id = :id");
            $stmt->execute(['p' => $newPassword, 'id' => $empId]);
            echo json_encode(["status" => "success", "message" => "Password changed successfully"]);
            break;

        case 'update_profile_pic':
            $empId = $requestData['employee_id'];
            $pic = $requestData['profile_pic'];
            $stmt = $pdo->prepare("UPDATE employees SET profile_pic = :p WHERE id = :id");
            $stmt->execute(['p' => $pic, 'id' => $empId]);
            echo json_encode(["status" => "success", "message" => "Profile picture updated"]);
            break;

        default:
            echo json_encode(["status" => "error", "message" => "Invalid action specified."]);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
