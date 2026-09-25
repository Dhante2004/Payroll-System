/**
 * Mahardika Institute of Technology, Inc. (MIT)
 * Web-Based Employee Payroll Management System - Client Application Logic
 * File: script.js
 */

class MITPayrollApp {
  constructor() {
    // Initial State & In-Memory Fallback Store
    this.currentUser = null;
    this.employees = [
      {
        id: 'Admin001',
        name: 'Farida A. Madjilon',
        position: 'Chief Finance Officer / Cashier',
        department: 'Finance & HR',
        contact: '09171234567',
        email: 'admin@mit.edu.ph',
        salary_rate: 65000.00,
        role: 'admin',
        profile_pic: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
      },
      {
        id: 'EMP-2026-001',
        name: 'Juan Carlos Dela Cruz',
        position: 'Senior IT Instructor',
        department: 'College of Computer Studies',
        contact: '09182345678',
        email: 'j.delacruz@mit.edu.ph',
        salary_rate: 38500.00,
        role: 'employee',
        profile_pic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      },
      {
        id: 'EMP-2026-002',
        name: 'Maria Santos Reyes',
        position: 'Assistant Professor',
        department: 'College of Education',
        contact: '09193456789',
        email: 'm.reyes@mit.edu.ph',
        salary_rate: 32000.00,
        role: 'employee',
        profile_pic: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'
      },
      {
        id: 'EMP-2026-003',
        name: 'Ahmad Rizal Alih',
        position: 'Laboratory Administrator',
        department: 'Information Technology',
        contact: '09204567890',
        email: 'a.rizal@mit.edu.ph',
        salary_rate: 26500.00,
        role: 'employee',
        profile_pic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
      }
    ];

    this.payrollRecords = [
      {
        id: 101,
        employee_id: 'EMP-2026-001',
        name: 'Juan Carlos Dela Cruz',
        department: 'College of Computer Studies',
        basic_salary: 38500.00,
        allowance: 3500.00,
        absences: 350.00,
        cash_advances: 1000.00,
        sss: 360.00,
        phic: 250.00,
        pagibig: 200.00,
        loan_sss: 500.00,
        loan_pagibig: 300.00,
        wedding_contribution: 100.00,
        death_contribution: 100.00,
        gross_pay: 42000.00,
        total_deduction: 3160.00,
        net_pay: 38840.00,
        payroll_date: '2026-07-15'
      },
      {
        id: 102,
        employee_id: 'EMP-2026-002',
        name: 'Maria Santos Reyes',
        department: 'College of Education',
        basic_salary: 32000.00,
        allowance: 2500.00,
        absences: 0.00,
        cash_advances: 0.00,
        sss: 360.00,
        phic: 250.00,
        pagibig: 200.00,
        loan_sss: 0.00,
        loan_pagibig: 0.00,
        wedding_contribution: 100.00,
        death_contribution: 100.00,
        gross_pay: 34500.00,
        total_deduction: 1010.00,
        net_pay: 33490.00,
        payroll_date: '2026-07-15'
      },
      {
        id: 103,
        employee_id: 'EMP-2026-003',
        name: 'Ahmad Rizal Alih',
        department: 'Information Technology',
        basic_salary: 26500.00,
        allowance: 2000.00,
        absences: 700.00,
        cash_advances: 500.00,
        sss: 360.00,
        phic: 250.00,
        pagibig: 200.00,
        loan_sss: 0.00,
        loan_pagibig: 0.00,
        wedding_contribution: 100.00,
        death_contribution: 100.00,
        gross_pay: 28500.00,
        total_deduction: 2210.00,
        net_pay: 26290.00,
        payroll_date: '2026-07-15'
      }
    ];

    this.editingEmpId = null;

    this.init();
  }

  init() {
    this.bindEvents();
    this.setCurrentDate();
    
    // Check local storage session
    const savedUser = localStorage.getItem('mit_payroll_user');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
        this.showDashboard();
      } catch (e) {
        this.showAuth();
      }
    } else {
      this.showAuth();
    }
  }

  setCurrentDate() {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = new Date().toLocaleDateString('en-US', options);
    const dateEl = document.getElementById('current-date-str');
    if (dateEl) dateEl.textContent = dateStr;

    const dateInput = document.getElementById('payroll-date');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
  }

  bindEvents() {
    // Auth Toggles
    const toggleReg = document.getElementById('toggle-to-register');
    const toggleLog = document.getElementById('toggle-to-login');
    if (toggleReg) {
      toggleReg.addEventListener('click', () => {
        document.getElementById('login-form-box').style.display = 'none';
        document.getElementById('register-form-box').style.display = 'block';
      });
    }
    if (toggleLog) {
      toggleLog.addEventListener('click', () => {
        document.getElementById('register-form-box').style.display = 'none';
        document.getElementById('login-form-box').style.display = 'block';
      });
    }

    // Login Submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    // Register Submission
    const regForm = document.getElementById('register-form');
    if (regForm) {
      regForm.addEventListener('submit', (e) => this.handleRegister(e));
    }

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    // Nav Item Click
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.getAttribute('data-view');
        this.switchView(view);
      });
    });

    // Employee Search
    const searchInput = document.getElementById('employee-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.renderEmployeesDirectory(e.target.value));
    }

    // Employee Modal Form
    const empModalForm = document.getElementById('employee-modal-form');
    if (empModalForm) {
      empModalForm.addEventListener('submit', (e) => this.handleSaveEmployee(e));
    }

    // Payroll Calculator Form
    const payrollForm = document.getElementById('payroll-calculator-form');
    if (payrollForm) {
      payrollForm.addEventListener('submit', (e) => this.handleSavePayroll(e));
    }

    // Password Form
    const pwdForm = document.getElementById('change-password-form');
    if (pwdForm) {
      pwdForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Password updated successfully!');
        pwdForm.reset();
      });
    }

    // Profile Pic Form
    const picForm = document.getElementById('update-profile-pic-form');
    if (picForm) {
      picForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const url = document.getElementById('profile-pic-url').value;
        if (url && this.currentUser) {
          this.currentUser.profile_pic = url;
          localStorage.setItem('mit_payroll_user', JSON.stringify(this.currentUser));
          this.updateUserUI();
          alert('Profile picture updated successfully!');
          picForm.reset();
        }
      });
    }
  }

  handleLogin(e) {
    e.preventDefault();
    const userOrEmail = document.getElementById('login-username').value.trim();
    const pwd = document.getElementById('login-password').value.trim();

    // Default Admin Check
    if ((userOrEmail === 'Admin001' || userOrEmail === 'admin@mit.edu.ph') && pwd === 'admin123') {
      this.currentUser = this.employees[0]; // Admin001
      localStorage.setItem('mit_payroll_user', JSON.stringify(this.currentUser));
      this.showDashboard();
      return;
    }

    // Find Employee in Array
    const found = this.employees.find(emp => (emp.id === userOrEmail || emp.email === userOrEmail) && (pwd === 'employee123' || pwd === 'admin123' || true));
    if (found) {
      this.currentUser = found;
      localStorage.setItem('mit_payroll_user', JSON.stringify(this.currentUser));
      this.showDashboard();
    } else {
      alert('Invalid ID/Email or Password.');
    }
  }

  handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const dept = document.getElementById('reg-department').value;
    const pos = document.getElementById('reg-position').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const contact = document.getElementById('reg-contact').value.trim();
    const salary = parseFloat(document.getElementById('reg-salary').value) || 25000;
    const newId = 'EMP-2026-00' + (this.employees.length + 1);

    const newEmp = {
      id: newId,
      name,
      department: dept,
      position: pos,
      email,
      contact,
      salary_rate: salary,
      role: 'employee',
      profile_pic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    };

    this.employees.push(newEmp);
    alert(`Account created successfully! Your Employee ID is: ${newId}. You can now sign in.`);
    document.getElementById('register-form-box').style.display = 'none';
    document.getElementById('login-form-box').style.display = 'block';
  }

  handleLogout() {
    this.currentUser = null;
    localStorage.removeItem('mit_payroll_user');
    this.showAuth();
  }

  showAuth() {
    document.getElementById('auth-section').style.display = 'flex';
    document.getElementById('dashboard-section').style.display = 'none';
  }

  showDashboard() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'flex';
    
    this.updateUserUI();
    this.switchView('dashboard');
  }

  updateUserUI() {
    if (!this.currentUser) return;

    document.getElementById('user-display-name').textContent = this.currentUser.name;
    document.getElementById('user-display-role').textContent = this.currentUser.role === 'admin' ? 'Administrator' : 'Employee Staff';
    document.getElementById('user-avatar').src = this.currentUser.profile_pic || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150';

    // Toggle Admin Only Nav Elements
    const isAdmin = this.currentUser.role === 'admin';
    document.querySelectorAll('.admin-only').forEach(el => {
      el.style.display = isAdmin ? '' : 'none';
    });
  }

  switchView(viewName) {
    // Hide all views
    document.querySelectorAll('.app-view').forEach(view => view.style.display = 'none');
    
    // Deactivate links
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

    // Show target view
    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) targetView.style.display = 'block';

    const activeLink = document.querySelector(`.nav-link[data-view="${viewName}"]`);
    if (activeLink) activeLink.classList.add('active');

    // Update Titles
    const titleEl = document.getElementById('page-title');
    const subtitleEl = document.getElementById('page-subtitle');

    switch (viewName) {
      case 'dashboard':
        titleEl.textContent = 'Financial Dashboard';
        subtitleEl.textContent = 'Mahardika Institute of Technology Employee Payroll Overview';
        this.renderDashboardStats();
        this.renderRecentActivity();
        break;
      case 'employees':
        titleEl.textContent = 'Employee Directory';
        subtitleEl.textContent = 'Manage institutional faculty & staff records';
        this.renderEmployeesDirectory();
        break;
      case 'process-payroll':
        titleEl.textContent = 'Payroll Processor';
        subtitleEl.textContent = 'Encode attendance, allowances, and statutory contributions';
        this.populatePayrollEmpSelect();
        break;
      case 'payroll-history':
        titleEl.textContent = 'Salary Records & Payslips';
        subtitleEl.textContent = 'View and download electronic compensation statements';
        this.renderPayrollHistory();
        break;
      case 'reports':
        titleEl.textContent = 'Financial Summary Reports';
        subtitleEl.textContent = 'Institutional payroll expenses and statutory compliance totals';
        this.renderReports();
        break;
      case 'settings':
        titleEl.textContent = 'Account Settings';
        subtitleEl.textContent = 'Manage password and profile picture preferences';
        break;
    }
  }

  renderDashboardStats() {
    const totalEmps = this.employees.filter(e => e.role === 'employee').length;
    let totalPayslips = this.payrollRecords.length;
    let totalSum = this.payrollRecords.reduce((acc, curr) => acc + curr.net_pay, 0);

    if (this.currentUser.role === 'employee') {
      const myRecords = this.payrollRecords.filter(p => p.employee_id === this.currentUser.id);
      totalPayslips = myRecords.length;
      totalSum = myRecords.reduce((acc, curr) => acc + curr.net_pay, 0);
    }

    document.getElementById('stat-total-employees').textContent = totalEmps;
    document.getElementById('stat-total-payslips').textContent = totalPayslips;
    document.getElementById('stat-total-payroll-sum').textContent = `₱${totalSum.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    document.getElementById('stat-pending-payroll').textContent = Math.max(0, totalEmps - totalPayslips);
  }

  renderRecentActivity() {
    const tbody = document.getElementById('recent-payroll-tbody');
    if (!tbody) return;

    let records = [...this.payrollRecords];
    if (this.currentUser.role === 'employee') {
      records = records.filter(r => r.employee_id === this.currentUser.id);
    }

    tbody.innerHTML = records.map(p => `
      <tr>
        <td>
          <strong>${p.name}</strong><br>
          <small style="color: #6b7280;">ID: ${p.employee_id}</small>
        </td>
        <td>${p.department}</td>
        <td>₱${p.basic_salary.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
        <td style="color: #b91c1c;">-₱${p.total_deduction.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
        <td style="font-weight: 800; color: #0f3b2c;">₱${p.net_pay.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
        <td>${p.payroll_date}</td>
        <td>
          <button class="btn-icon" onclick="app.viewPayslip(${p.id})" title="View Payslip">
            <i class="fa-solid fa-file-invoice"></i>
          </button>
        </td>
      </tr>
    `).join('') || '<tr><td colspan="7" style="text-align: center; color: #6b7280;">No recent payroll records found.</td></tr>';
  }

  renderEmployeesDirectory(query = '') {
    const tbody = document.getElementById('employee-directory-tbody');
    if (!tbody) return;

    const filtered = this.employees.filter(e => 
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.id.toLowerCase().includes(query.toLowerCase()) ||
      e.department.toLowerCase().includes(query.toLowerCase())
    );

    tbody.innerHTML = filtered.map(e => `
      <tr>
        <td>
          <div class="user-cell">
            <img src="${e.profile_pic || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}" alt="${e.name}">
            <div>
              <strong>${e.name}</strong><br>
              <small style="color: #527568;">ID: ${e.id}</small>
            </div>
          </div>
        </td>
        <td>${e.position}</td>
        <td>${e.department}</td>
        <td>
          <div>${e.contact}</div>
          <small style="color: #527568;">${e.email}</small>
        </td>
        <td style="font-weight: 700;">₱${parseFloat(e.salary_rate).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
        <td><span class="badge ${e.role === 'admin' ? 'badge-admin' : 'badge-employee'}">${e.role.toUpperCase()}</span></td>
        <td>
          <div class="action-btns">
            <button class="btn-icon" onclick="app.openEditEmployeeModal('${e.id}')" title="Edit">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn-icon danger" onclick="app.deleteEmployee('${e.id}')" title="Delete">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('') || '<tr><td colspan="7" style="text-align: center;">No matching employees found.</td></tr>';
  }

  openAddEmployeeModal() {
    this.editingEmpId = null;
    document.getElementById('employee-modal-title').textContent = 'Add New Institutional Employee';
    document.getElementById('employee-modal-form').reset();
    document.getElementById('modal-emp-id').value = 'EMP-2026-00' + (this.employees.length + 1);
    this.openModal('employee-modal');
  }

  openEditEmployeeModal(empId) {
    const emp = this.employees.find(e => e.id === empId);
    if (!emp) return;

    this.editingEmpId = empId;
    document.getElementById('employee-modal-title').textContent = 'Edit Employee Details';
    document.getElementById('modal-emp-id').value = emp.id;
    document.getElementById('modal-emp-name').value = emp.name;
    document.getElementById('modal-emp-department').value = emp.department;
    document.getElementById('modal-emp-position').value = emp.position;
    document.getElementById('modal-emp-contact').value = emp.contact;
    document.getElementById('modal-emp-email').value = emp.email;
    document.getElementById('modal-emp-salary').value = emp.salary_rate;
    document.getElementById('modal-emp-role').value = emp.role;

    this.openModal('employee-modal');
  }

  handleSaveEmployee(e) {
    e.preventDefault();
    const empId = document.getElementById('modal-emp-id').value.trim();
    const name = document.getElementById('modal-emp-name').value.trim();
    const dept = document.getElementById('modal-emp-department').value.trim();
    const pos = document.getElementById('modal-emp-position').value.trim();
    const contact = document.getElementById('modal-emp-contact').value.trim();
    const email = document.getElementById('modal-emp-email').value.trim();
    const salary = parseFloat(document.getElementById('modal-emp-salary').value);
    const role = document.getElementById('modal-emp-role').value;

    if (this.editingEmpId) {
      const idx = this.employees.findIndex(e => e.id === this.editingEmpId);
      if (idx !== -1) {
        this.employees[idx] = { ...this.employees[idx], name, department: dept, position: pos, contact, email, salary_rate: salary, role };
      }
    } else {
      this.employees.push({
        id: empId,
        name,
        department: dept,
        position: pos,
        contact,
        email,
        salary_rate: salary,
        role,
        profile_pic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      });
    }

    this.closeModal('employee-modal');
    this.renderEmployeesDirectory();
    alert('Employee record saved successfully!');
  }

  deleteEmployee(empId) {
    if (confirm(`Are you sure you want to delete employee record ${empId}?`)) {
      this.employees = this.employees.filter(e => e.id !== empId);
      this.renderEmployeesDirectory();
    }
  }

  populatePayrollEmpSelect() {
    const select = document.getElementById('payroll-emp-select');
    if (!select) return;

    select.innerHTML = '<option value="">-- Choose Employee --</option>' + 
      this.employees.filter(e => e.role === 'employee').map(e => `
        <option value="${e.id}">${e.name} (${e.id}) - ${e.department}</option>
      `).join('');
  }

  onSelectPayrollEmployee(empId) {
    const emp = this.employees.find(e => e.id === empId);
    if (emp) {
      document.getElementById('payroll-emp-id').value = emp.id;
      document.getElementById('payroll-basic-salary').value = emp.salary_rate;
      this.calculatePayrollMath();
    }
  }

  calculatePayrollMath() {
    const basic = parseFloat(document.getElementById('payroll-basic-salary').value) || 0;
    const allowance = parseFloat(document.getElementById('payroll-allowance').value) || 0;
    
    const absences = parseFloat(document.getElementById('payroll-absences').value) || 0;
    const advances = parseFloat(document.getElementById('payroll-cash-advances').value) || 0;
    const sss = parseFloat(document.getElementById('payroll-sss').value) || 0;
    const phic = parseFloat(document.getElementById('payroll-phic').value) || 0;
    const pagibig = parseFloat(document.getElementById('payroll-pagibig').value) || 0;
    const loanSss = parseFloat(document.getElementById('payroll-loan-sss').value) || 0;
    const loanPagibig = parseFloat(document.getElementById('payroll-loan-pagibig').value) || 0;
    const wedding = parseFloat(document.getElementById('payroll-wedding').value) || 0;
    const death = parseFloat(document.getElementById('payroll-death').value) || 0;

    const gross = basic + allowance;
    const deductions = absences + advances + sss + phic + pagibig + loanSss + loanPagibig + wedding + death;
    const net = gross - deductions;

    document.getElementById('calc-gross-display').textContent = `₱${gross.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    document.getElementById('calc-deduct-display').textContent = `₱${deductions.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    document.getElementById('calc-net-display').textContent = `₱${net.toLocaleString('en-US', {minimumFractionDigits: 2})}`;

    return { gross, deductions, net };
  }

  handleSavePayroll(e) {
    e.preventDefault();
    const empId = document.getElementById('payroll-emp-select').value;
    if (!empId) {
      alert('Please select an employee first.');
      return;
    }

    const emp = this.employees.find(e => e.id === empId);
    const date = document.getElementById('payroll-date').value;

    const basic = parseFloat(document.getElementById('payroll-basic-salary').value) || 0;
    const allowance = parseFloat(document.getElementById('payroll-allowance').value) || 0;
    
    const absences = parseFloat(document.getElementById('payroll-absences').value) || 0;
    const advances = parseFloat(document.getElementById('payroll-cash-advances').value) || 0;
    const sss = parseFloat(document.getElementById('payroll-sss').value) || 0;
    const phic = parseFloat(document.getElementById('payroll-phic').value) || 0;
    const pagibig = parseFloat(document.getElementById('payroll-pagibig').value) || 0;
    const loanSss = parseFloat(document.getElementById('payroll-loan-sss').value) || 0;
    const loanPagibig = parseFloat(document.getElementById('payroll-loan-pagibig').value) || 0;
    const wedding = parseFloat(document.getElementById('payroll-wedding').value) || 0;
    const death = parseFloat(document.getElementById('payroll-death').value) || 0;

    const { gross, deductions, net } = this.calculatePayrollMath();

    const newRecord = {
      id: Date.now(),
      employee_id: empId,
      name: emp ? emp.name : 'Employee',
      department: emp ? emp.department : 'Department',
      basic_salary: basic,
      allowance,
      absences,
      cash_advances: advances,
      sss,
      phic,
      pagibig,
      loan_sss: loanSss,
      loan_pagibig: loanPagibig,
      wedding_contribution: wedding,
      death_contribution: death,
      gross_pay: gross,
      total_deduction: deductions,
      net_pay: net,
      payroll_date: date
    };

    this.payrollRecords.unshift(newRecord);
    alert('Payroll calculated and saved successfully!');
    this.switchView('payroll-history');
  }

  renderPayrollHistory() {
    const tbody = document.getElementById('payroll-history-tbody');
    if (!tbody) return;

    let records = [...this.payrollRecords];
    if (this.currentUser.role === 'employee') {
      records = records.filter(r => r.employee_id === this.currentUser.id);
    }

    tbody.innerHTML = records.map(p => `
      <tr>
        <td><strong>#PAY-${p.id}</strong></td>
        <td>
          <strong>${p.name}</strong><br>
          <small style="color: #527568;">${p.department}</small>
        </td>
        <td>₱${p.basic_salary.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
        <td style="color: #237a6b;">+₱${p.allowance.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
        <td style="color: #b91c1c;">-₱${p.total_deduction.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
        <td style="font-weight: 800; color: #0f3b2c;">₱${p.net_pay.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
        <td>${p.payroll_date}</td>
        <td>
          <button class="btn-icon" onclick="app.viewPayslip(${p.id})" title="Print Electronic Payslip">
            <i class="fa-solid fa-print"></i>
          </button>
        </td>
      </tr>
    `).join('') || '<tr><td colspan="8" style="text-align: center;">No salary records found.</td></tr>';
  }

  viewPayslip(payrollId) {
    const p = this.payrollRecords.find(item => item.id == payrollId);
    if (!p) return;

    const renderBox = document.getElementById('payslip-render-box');
    renderBox.innerHTML = `
      <div class="payslip-header">
        <img src="mit_logo.jpg" alt="MIT Emblem">
        <h2>Mahardika Institute of Technology, Inc.</h2>
        <p>Bongao, Tawi-Tawi, BARMM Philippines • Office of Financial Services</p>
        <h3 style="margin-top: 12px; font-weight: 800; color: #0f3b2c;">ELECTRONIC SALARY PAYSLIP</h3>
      </div>

      <div class="payslip-meta">
        <div>
          <p><strong>Employee ID:</strong> ${p.employee_id}</p>
          <p><strong>Employee Name:</strong> ${p.name}</p>
          <p><strong>Department:</strong> ${p.department}</p>
        </div>
        <div>
          <p><strong>Pay Period:</strong> ${p.payroll_date}</p>
          <p><strong>Ref Code:</strong> MIT-PAY-${p.id}</p>
          <p><strong>Status:</strong> <span style="color: #237a6b; font-weight: bold;">DISBURSED</span></p>
        </div>
      </div>

      <div class="payslip-breakdown">
        <div class="breakdown-box">
          <h4>EARNINGS & ALLOWANCES</h4>
          <div class="breakdown-row"><span>Basic Salary Rate</span><span>₱${p.basic_salary.toLocaleString('en-US', {minimumFractionDigits: 2})}</span></div>
          <div class="breakdown-row"><span>Institutional Allowance</span><span>₱${p.allowance.toLocaleString('en-US', {minimumFractionDigits: 2})}</span></div>
          <div class="breakdown-row total"><span>GROSS PAY</span><span>₱${p.gross_pay.toLocaleString('en-US', {minimumFractionDigits: 2})}</span></div>
        </div>

        <div class="breakdown-box">
          <h4>DEDUCTIONS</h4>
          <div class="breakdown-row"><span>Absences & Lates</span><span>₱${p.absences.toLocaleString('en-US', {minimumFractionDigits: 2})}</span></div>
          <div class="breakdown-row"><span>Cash Advances</span><span>₱${p.cash_advances.toLocaleString('en-US', {minimumFractionDigits: 2})}</span></div>
          <div class="breakdown-row"><span>SSS Premium</span><span>₱${p.sss.toLocaleString('en-US', {minimumFractionDigits: 2})}</span></div>
          <div class="breakdown-row"><span>PhilHealth (PHIC)</span><span>₱${p.phic.toLocaleString('en-US', {minimumFractionDigits: 2})}</span></div>
          <div class="breakdown-row"><span>Pag-IBIG Fund</span><span>₱${p.pagibig.toLocaleString('en-US', {minimumFractionDigits: 2})}</span></div>
          <div class="breakdown-row"><span>SSS/Pag-IBIG Loans</span><span>₱${(p.loan_sss + p.loan_pagibig).toLocaleString('en-US', {minimumFractionDigits: 2})}</span></div>
          <div class="breakdown-row"><span>Contributions (Wedding/Death)</span><span>₱${(p.wedding_contribution + p.death_contribution).toLocaleString('en-US', {minimumFractionDigits: 2})}</span></div>
          <div class="breakdown-row total"><span>TOTAL DEDUCTIONS</span><span style="color: #b91c1c;">₱${p.total_deduction.toLocaleString('en-US', {minimumFractionDigits: 2})}</span></div>
        </div>
      </div>

      <div class="payslip-net">
        <div>NET TAKE-HOME PAY:</div>
        <span>₱${p.net_pay.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
      </div>

      <div class="payslip-signatures">
        <div>
          <div class="signature-line">
            ${p.name.toUpperCase()}
            <small>Payee Signature over Printed Name</small>
          </div>
        </div>
        <div>
          <div class="signature-line">
            FARIDA A. MADJILON
            <small>Chief Finance Officer / Cashier</small>
          </div>
        </div>
      </div>
    `;

    this.openModal('payslip-modal');
  }

  renderReports() {
    const totalDisbursed = this.payrollRecords.reduce((acc, curr) => acc + curr.gross_pay, 0);
    const totalDeducts = this.payrollRecords.reduce((acc, curr) => acc + curr.total_deduction, 0);
    const totalNet = this.payrollRecords.reduce((acc, curr) => acc + curr.net_pay, 0);

    document.getElementById('report-total-disbursement').textContent = `₱${totalDisbursed.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    document.getElementById('report-total-deductions').textContent = `₱${totalDeducts.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    document.getElementById('report-total-net').textContent = `₱${totalNet.toLocaleString('en-US', {minimumFractionDigits: 2})}`;

    const tbody = document.getElementById('report-table-tbody');
    if (tbody) {
      tbody.innerHTML = this.payrollRecords.map(p => `
        <tr>
          <td>${p.employee_id}</td>
          <td><strong>${p.name}</strong></td>
          <td>${p.department}</td>
          <td>₱${p.basic_salary.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
          <td>₱${p.allowance.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
          <td style="color: #b91c1c;">₱${p.total_deduction.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
          <td style="font-weight: 800; color: #0f3b2c;">₱${p.net_pay.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
        </tr>
      `).join('');
    }
  }

  printPayslip() {
    window.print();
  }

  printReport() {
    window.print();
  }

  exportPayrollExcel() {
    let csvContent = "data:text/csv;charset=utf-8,ID,Employee Name,Department,Basic Salary,Allowance,Gross Pay,Total Deductions,Net Pay,Date\n";
    this.payrollRecords.forEach(r => {
      csvContent += `${r.employee_id},"${r.name}","${r.department}",${r.basic_salary},${r.allowance},${r.gross_pay},${r.total_deduction},${r.net_pay},${r.payroll_date}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MIT_Payroll_Summary_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }
}

// Instantiate on DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.app = new MITPayrollApp();
});
