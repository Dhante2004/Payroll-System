'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};
const positions = ['FACULTY', 'STAFF', 'REGISTRAR', 'CASHIER', 'DEAN', 'VPAA', 'HRMO'];
const departments = [
  'Nursing Department',
  'Teacher Education Department',
  'Engineering Department',
  'Information and Computer Technology Department',
  'Criminology Department',
  'HRM Department',
  'Business Administration Department',
  'Social Work Department'
];

function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  FileText,
  Vault,
  Clock,
  Plus,
  PenSquare,
  Trash2,
  Printer,
  FileSpreadsheet,
  LogOut,
  ShieldCheck,
  Calculator,
  UserPlus,
  Search,
  CheckCircle,
  Code,
  Download,
  Copy,
  ChevronRight,
  Eye,
  X,
  RotateCcw,
  Check,
  Sparkles,
  UserRound
} from 'lucide-react';

interface Employee {
  id: string;
  userId?: string;
  uid?: string;
  mongoId?: string;
  name: string;
  position: string;
  department: string;
  contact: string;
  email: string;
  salary_rate: number;
  role: 'admin' | 'employee';
  approved?: boolean;
  profile_pic?: string;
}

interface PayrollRecord {
  id: number;
  employeeUid?: string;
  employee_id: string;
  name: string;
  department: string;
  basic_salary: number;
  allowance: number;
  absences: number;
  late_minutes?: number;
  cash_advances: number;
  sss: number;
  phic: number;
  pagibig: number;
  wtax?: number;
  loan_sss: number;
  loan_pagibig: number;
  other_deductions?: number;
  gross_pay: number;
  total_deduction: number;
  net_pay: number;
  payroll_date: string;
}

function getPayslipPeriod(payrollDate: string) {
  const [year, month, day] = payrollDate.split('-').map(Number);
  const periodEnd = new Date(year, month - 1, day);
  const periodStart = new Date(periodEnd);
  periodStart.setDate(periodStart.getDate() - 14);
  const formatDate = (date: Date) => date.toLocaleDateString('en-PH', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return `${formatDate(periodStart)} to ${formatDate(periodEnd)}`;
}

function getPeriodStartInput(payrollDate: string) {
  const [year, month, day] = payrollDate.split('-').map(Number);
  const periodStart = new Date(year, month - 1, day);
  periodStart.setDate(periodStart.getDate() - 14);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${periodStart.getFullYear()}-${pad(periodStart.getMonth() + 1)}-${pad(periodStart.getDate())}`;
}

function formatPayrollDate(payrollDate: string) {
  const [year, month, day] = payrollDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-PH', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

function displayPayrollNumber(value: number) {
  const numericValue = Number(value);
  return numericValue === 0 ? '' : numericValue;
}

function compressProfileImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const image = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      const maxDimension = 1200;
      const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      canvas.toBlob(blob => {
        if (!blob) {
          reject(new Error('The selected image could not be compressed.'));
          return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('The compressed image could not be read.'));
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.78);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Please choose a valid image file.'));
    };
    image.src = objectUrl;
  });
}

function PayslipCopy({ record }: { record: PayrollRecord }) {
  return (
    <div className="payslip-copy bg-white p-8 space-y-6">
      <div className="text-center border-b-2 border-[#0f3b2c] pb-5">
        <img src="/mit-seal.png" alt="MIT Emblem" width="64" height="64" className="print-logo mx-auto rounded-full mb-2" />
        <h2 className="font-serif text-2xl font-bold text-[#0f3b2c]">Mahardika Institute of Technology, Inc.</h2>
        <p className="text-xs text-gray-500 uppercase tracking-widest mt-0.5">ILMOH st. Lamion, Bongao, Tawi-Tawi</p>
        <h3 className="text-sm font-extrabold text-[#0f3b2c] mt-3 uppercase tracking-wider bg-[#eef7f4] py-1.5 px-4 rounded-full inline-block">PAYSLIP</h3>
      </div>

      <div className="bg-[#f5fbf9] p-4 rounded-2xl border border-[#dcf1ec] text-sm space-y-2">
        <p><strong>Name of Employee:</strong> {record.name}</p>
        <p><strong>Payslip for the period covered:</strong> {getPayslipPeriod(record.payroll_date)}</p>
      </div>

      <p className="text-xs leading-relaxed text-gray-700 border-l-4 border-[#2baf9a] pl-4">
        &quot;I HEREBY ACKNOWLEDGE to have received from MAHARDIKA INSTITUTE OF TECHNOLOGY, INC. with business address at ILMOH st. Lamion, Bongao, Tawi-Tawi, the sum specified herein as full compensation for the service rendered.&quot;
      </p>

      <div className="bg-[#fbfdfe] border border-[#e2efe9] rounded-2xl p-5 space-y-2 text-sm">
        <div className="flex justify-between font-bold text-[#0f3b2c] border-b border-[#e2efe9] pb-2"><span>Gross Pay:</span><span>₱{record.gross_pay.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
        <div className="font-bold text-[#1f5e4a] pt-2">Less: Deduction</div>
        <div className="flex justify-between text-xs"><span>Absences / Late</span><span>₱{Number(record.absences || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
        <div className="flex justify-between text-xs"><span>Cash Advances</span><span>₱{record.cash_advances.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
        <div className="flex justify-between text-xs"><span>SSS Premium Contribution</span><span>₱{record.sss.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
        <div className="flex justify-between text-xs"><span>PHIC Premium Contribution</span><span>₱{record.phic.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
        <div className="flex justify-between text-xs"><span>Pag-IBIG Premium Contribution</span><span>₱{record.pagibig.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
        <div className="flex justify-between text-xs"><span>Wtax</span><span>₱{Number(record.wtax || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
        <div className="font-bold text-[#1f5e4a] pt-2">Loan</div>
        <div className="flex justify-between text-xs"><span>Loan: SSS</span><span>₱{record.loan_sss.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
        <div className="flex justify-between text-xs"><span>Loan: Pag-IBIG</span><span>₱{record.loan_pagibig.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
        <div className="flex justify-between text-xs"><span>Other deduction</span><span>₱{Number(record.other_deductions || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
        <div className="flex justify-between font-bold text-red-600 border-t border-[#e2efe9] pt-2 mt-2">
          <span>Total Deduction:</span><span>₱{record.total_deduction.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div className="bg-[#0f3e38] text-white p-5 rounded-2xl flex justify-between items-center text-sm font-bold shadow-md">
        <div>Net Pay:</div>
        <span className="text-2xl font-extrabold text-[#f1c40f]">₱{record.net_pay.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      </div>

      <div className="grid grid-cols-2 gap-10 pt-6 text-xs">
        <div>
          <p className="font-bold mb-8">Prepared &amp; Paid by:</p>
          <div className="border-t border-[#0f3b2c] pt-2 font-bold uppercase text-[#0f3b2c]">________________________</div>
          <div className="text-gray-500 text-[10px]">Cashier</div>
          <p className="mt-4">Date: {formatPayrollDate(record.payroll_date)}</p>
        </div>
        <div>
          <p className="font-bold mb-8">Payment Received by:</p>
          <div className="border-t border-[#0f3b2c] pt-2 font-bold uppercase text-[#0f3b2c]">________________________</div>
          <div className="font-bold uppercase text-[#0f3b2c]">{record.name}</div>
          <div className="text-gray-500 text-[10px]">Employee Signature over Printed Name</div>
          <p className="mt-4">Date: {formatPayrollDate(record.payroll_date)}</p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  // Navigation & View
  const [activeView, setActiveView] = useState<'dashboard' | 'employees' | 'process-payroll' | 'payroll-history' | 'reports' | 'settings' | 'deliverables'>('dashboard');
  
  // Mounting & Hydration state
  const isMounted = useIsMounted();

  // Auth state
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth').then(response => response.json()),
      fetch('/api/data').then(response => response.ok ? response.json() : null)
    ]).then(([authData, data]) => {
      setCurrentUser(authData.user ?? null);
      if (data) {
        setEmployees(data.employees);
        setPayrollRecords(data.payrollRecords);
      }
    }).catch(() => setCurrentUser(null)).finally(() => setSessionReady(true));
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    setProfileForm({
      name: currentUser.name,
      position: currentUser.position,
      department: currentUser.department,
      profile_pic: currentUser.profile_pic || ''
    });
  }, [currentUser]);

  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Login Form
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginStep, setLoginStep] = useState<'credentials' | 'otp'>('credentials');
  const [loginOtp, setLoginOtp] = useState('');
  const [loginOtpEmail, setLoginOtpEmail] = useState('');
  const [loginOtpNotice, setLoginOtpNotice] = useState('');

  // Forgot Password Form
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotPassword, setForgotPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request');
  const [forgotNotice, setForgotNotice] = useState('');

  // Profile Form
  const [profileForm, setProfileForm] = useState({ name: '', position: '', department: '', profile_pic: '' });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profileMessage, setProfileMessage] = useState('');

  // Register Form
  const [regData, setRegData] = useState({
    employeeId: '',
    name: '',
    department: departments[0],
    position: positions[0],
    email: '',
    contact: '09170000000',
    salary_rate: 30000,
    password: ''
  });
  const [registrationStep, setRegistrationStep] = useState<'form' | 'otp' | 'pending'>('form');
  const [otpCode, setOtpCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [regOtpNotice, setRegOtpNotice] = useState('');

  // Data Collections
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: 'Admin001',
      name: 'Cashier',
      position: 'Cashier',
      department: 'Finance & HR',
      contact: '09171234567',
      email: 'admin@mit.edu.ph',
      salary_rate: 65000.00,
      role: 'admin',
      profile_pic: undefined
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
  ]);

  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([
    {
      id: 101,
      employee_id: 'EMP-2026-001',
      name: 'Juan Carlos Dela Cruz',
      department: 'College of Computer Studies',
      basic_salary: 38500.00,
      allowance: 3500.00,
      absences: 350.00,
      late_minutes: 0,
      cash_advances: 1000.00,
      sss: 360.00,
      phic: 250.00,
      pagibig: 200.00,
      wtax: 0,
      loan_sss: 500.00,
      loan_pagibig: 300.00,
      other_deductions: 200.00,
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
      late_minutes: 0,
      cash_advances: 0.00,
      sss: 360.00,
      phic: 250.00,
      pagibig: 200.00,
      wtax: 0,
      loan_sss: 0.00,
      loan_pagibig: 0.00,
      other_deductions: 200.00,
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
      late_minutes: 0,
      cash_advances: 500.00,
      sss: 360.00,
      phic: 250.00,
      pagibig: 200.00,
      wtax: 0,
      loan_sss: 0.00,
      loan_pagibig: 0.00,
      other_deductions: 200.00,
      gross_pay: 28500.00,
      total_deduction: 2210.00,
      net_pay: 26290.00,
      payroll_date: '2026-07-15'
    }
  ]);

  // Employee Search
  const [empSearch, setEmpSearch] = useState('');
  const [employeeSort, setEmployeeSort] = useState<'id' | 'name' | 'department'>('id');
  const [payrollSort, setPayrollSort] = useState<'new-old' | 'old-new'>('new-old');
  const [payrollMonth, setPayrollMonth] = useState('');
  const [payrollYear, setPayrollYear] = useState('');

  // Modals
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [editingEmpId, setEditingEmpId] = useState<string | null>(null);
  const [empModalForm, setEmpModalForm] = useState<Employee>({
    id: '',
    name: '',
    department: 'College of Computer Studies',
    position: 'Instructor',
    contact: '09170000000',
    email: '',
    salary_rate: 30000,
    role: 'employee'
  });

  // Payroll Processing Form
  const [payrollForm, setPayrollForm] = useState({
    employee_id: '',
    basic_salary: 0,
    allowance: 0,
    late_minutes: 0,
    cash_advances: 0,
    sss: 0,
    phic: 0,
    pagibig: 0,
    wtax: 0,
    loan_sss: 0,
    loan_pagibig: 0,
    other_deductions: 0,
    payroll_date: '2026-07-28'
  });

  // Payslip View Modal
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);
  const [payslipCopies, setPayslipCopies] = useState<1 | 2>(1);

  // Deliverable Code Viewer
  const [deliverableFile, setDeliverableFile] = useState<'database.sql' | 'api.php' | 'db.php' | 'index.html' | 'style.css' | 'script.js'>('database.sql');
  const [sourceCodeText, setSourceCodeText] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Fetch deliverable source code content
  useEffect(() => {
    if (activeView === 'deliverables') {
      fetch(`/${deliverableFile}`)
        .then(res => res.text())
        .then(text => setSourceCodeText(text))
        .catch(() => setSourceCodeText(`-- Content for ${deliverableFile} is loaded in workspace repository --`));
    }
  }, [activeView, deliverableFile]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sourceCodeText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleResetPayrollForm = () => {
    setPayrollForm({
      employee_id: '',
      basic_salary: 0,
      allowance: 0,
      late_minutes: 0,
      cash_advances: 0,
      sss: 0,
      phic: 0,
      pagibig: 0,
      wtax: 0,
      loan_sss: 0,
      loan_pagibig: 0,
      other_deductions: 0,
      payroll_date: '2026-07-28'
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
        try {
          const response = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'login', login: loginUser, password: loginPass })
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.message);
          if (result.status === 'success') {
            setCurrentUser(result.user);
            const dataResponse = await fetch('/api/data');
            const data = await dataResponse.json();
            setEmployees(data.employees);
            setPayrollRecords(data.payrollRecords);
            return;
          }
          setLoginOtpEmail(result.email || loginUser);
          setLoginOtpNotice(result.testNotice || '');
          setLoginStep('otp');
          setLoginOtp('');
          setLoginOtp(result.devCode || '');
        } catch (error) {
          alert(error instanceof Error ? error.message : 'Invalid email or password.');
        }
  };

  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'forgot-password', email: forgotEmail })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setForgotNotice(result.testNotice || '');
      setForgotOtp(result.devCode || '');
      setForgotStep('reset');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to send the password reset code.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset-password', email: forgotEmail, code: forgotOtp, newPassword: forgotPassword })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setAuthMode('login');
      setForgotStep('request');
      setForgotOtp('');
      setForgotPassword('');
      alert('Password reset successfully. You can now sign in.');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to reset the password.');
    }
  };

  const handleVerifyLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify-login-otp', email: loginOtpEmail, code: loginOtp })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setCurrentUser(result.user);
      const dataResponse = await fetch('/api/data');
      const data = await dataResponse.json();
      setEmployees(data.employees);
      setPayrollRecords(data.payrollRecords);
      setLoginStep('credentials');
      setLoginOtp('');
      setLoginOtpNotice('');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to verify the login.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
        try {
          const response = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'register', ...regData })
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.message);
          setPendingEmail(result.email || regData.email);
          setRegOtpNotice(result.testNotice || '');
          setRegistrationStep('otp');
          setOtpCode('');
          setOtpCode(result.devCode || '');
        } catch (error) {
          alert(error instanceof Error ? error.message : 'Unable to create the account.');
        }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify-otp', email: pendingEmail, code: otpCode })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setRegistrationStep('pending');
      setOtpCode('');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to verify the account.');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const profilePic = profilePhoto ? await compressProfileImage(profilePhoto) : profileForm.profile_pic;
      const response = await fetch('/api/data', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'profile',
          profile: {
            name: profileForm.name,
            position: profileForm.position,
            department: profileForm.department,
            profile_pic: profilePic
          }
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setCurrentUser(result.employee);
      setProfilePhoto(null);
      setProfileMessage('Profile updated successfully.');
    } catch (error) {
      setProfileMessage(error instanceof Error ? error.message : 'Unable to update your profile.');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' })
    });
    setCurrentUser(null);
  };

  // Real-time payroll calculation helper
  const calcGross = Number(payrollForm.basic_salary || 0) + Number(payrollForm.allowance || 0);
  const calcAbsences = Number(payrollForm.basic_salary || 0) / 30 / 8 / 60 * Number(payrollForm.late_minutes || 0);
  const calcDeductions =
    calcAbsences +
    Number(payrollForm.cash_advances || 0) +
    Number(payrollForm.sss || 0) +
    Number(payrollForm.phic || 0) +
    Number(payrollForm.pagibig || 0) +
    Number(payrollForm.wtax || 0) +
    Number(payrollForm.loan_sss || 0) +
    Number(payrollForm.loan_pagibig || 0) +
    Number(payrollForm.other_deductions || 0);
  const calcNet = calcGross - calcDeductions;

  const handleSelectPayrollEmp = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    if (emp) {
      setPayrollForm(prev => ({
        ...prev,
        employee_id: emp.id,
        basic_salary: emp.salary_rate
      }));
    }
  };

  const handleSavePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payrollForm.employee_id) {
      alert('Please select an employee.');
      return;
    }
    const emp = employees.find(e => e.id === payrollForm.employee_id);

    const newRecord: PayrollRecord = {
      id: Date.now(),
      employee_id: payrollForm.employee_id,
      name: emp ? emp.name : 'Faculty Staff',
      department: emp ? emp.department : 'Academic Dept',
      basic_salary: Number(payrollForm.basic_salary),
      allowance: Number(payrollForm.allowance),
      absences: calcAbsences,
      late_minutes: Number(payrollForm.late_minutes),
      cash_advances: Number(payrollForm.cash_advances),
      sss: Number(payrollForm.sss),
      phic: Number(payrollForm.phic),
      pagibig: Number(payrollForm.pagibig),
      wtax: Number(payrollForm.wtax),
      loan_sss: Number(payrollForm.loan_sss),
      loan_pagibig: Number(payrollForm.loan_pagibig),
      other_deductions: Number(payrollForm.other_deductions),
      gross_pay: calcGross,
      total_deduction: calcDeductions,
      net_pay: calcNet,
      payroll_date: payrollForm.payroll_date
    };

    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'payroll', record: { ...newRecord, employeeUid: emp?.userId ?? emp?.uid } })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      const savedRecord = result.record as PayrollRecord;
      setPayrollRecords(prev => [savedRecord, ...prev]);
      setSelectedPayslip(savedRecord);
      setActiveView('payroll-history');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to save the payroll record.');
    }
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const employee = editingEmpId ? employees.find(emp => emp.id === editingEmpId) : null;
      const response = await fetch('/api/data', {
        method: editingEmpId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingEmpId
          ? { mongoId: employee?.mongoId, employee: empModalForm }
          : { action: 'employee', employee: empModalForm })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      if (editingEmpId) {
        setEmployees(prev => prev.map(emp => emp.id === editingEmpId ? { ...empModalForm, mongoId: employee?.mongoId, uid: employee?.uid } : emp));
      } else {
        setEmployees(prev => [...prev, result.employee]);
      }
      setIsEmpModalOpen(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to save the employee profile.');
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (confirm(`Delete employee record ${id}?`)) {
      const employee = employees.find(emp => emp.id === id);
      try {
        const response = await fetch('/api/data', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mongoId: employee?.mongoId })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        setEmployees(prev => prev.filter(e => e.id !== id));
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Unable to delete the employee profile.');
      }
    }
  };

  const handleDownloadPayslip = (employeeId: string) => {
    const latestPayroll = payrollRecords
      .filter(record => record.employee_id === employeeId)
      .sort((first, second) => second.payroll_date.localeCompare(first.payroll_date))[0];
    if (!latestPayroll) {
      alert('No payslip is available for this employee yet.');
      return;
    }
    setPayslipCopies(1);
    setSelectedPayslip(latestPayroll);
    window.setTimeout(() => window.print(), 100);
  };

  const handleOpenPayslip = (record: PayrollRecord) => {
    setPayslipCopies(1);
    setSelectedPayslip(record);
  };

  const handlePrintPayslip = (copies: 1 | 2) => {
    setPayslipCopies(copies);
    window.setTimeout(() => window.print(), 0);
  };

  const handleApproveEmployee = async (employee: Employee) => {
    if (!employee.mongoId) return;
    try {
      const response = await fetch('/api/data', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve-employee', mongoId: employee.mongoId })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setEmployees(prev => prev.map(item => item.mongoId === employee.mongoId ? { ...item, approved: true } : item));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to approve the employee account.');
    }
  };

  const exportExcelCSV = () => {
    let csv = "ID,Employee Name,Department,Basic Salary,Allowance,Gross Pay,Total Deductions,Net Pay,Date\n";
    payrollRecords.forEach(r => {
      csv += `${r.employee_id},"${r.name}","${r.department}",${r.basic_salary},${r.allowance},${r.gross_pay},${r.total_deduction},${r.net_pay},${r.payroll_date}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MIT_Payroll_Summary_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Stats calculations
  const totalEmployees = employees.filter(e => e.role === 'employee').length;
  const filteredRecords = currentUser?.role === 'employee'
    ? payrollRecords.filter(record =>
      record.employee_id === currentUser.id ||
      Boolean(currentUser.userId && record.employeeUid === currentUser.userId)
    )
    : payrollRecords;
  const displayedPayrollRecords = filteredRecords
    .filter(record => !payrollMonth || record.payroll_date.startsWith(payrollMonth))
    .filter(record => !payrollYear || record.payroll_date.startsWith(`${payrollYear}-`))
    .sort((first, second) => payrollSort === 'new-old'
      ? second.payroll_date.localeCompare(first.payroll_date)
      : first.payroll_date.localeCompare(second.payroll_date));
  const displayedEmployees = employees
    .filter(employee => employee.name.toLowerCase().includes(empSearch.toLowerCase()) || employee.id.toLowerCase().includes(empSearch.toLowerCase()))
    .sort((first, second) => {
      if (employeeSort === 'name') return first.name.localeCompare(second.name);
      if (employeeSort === 'department') return first.department.localeCompare(second.department) || first.name.localeCompare(second.name);
      return first.id.localeCompare(second.id);
    });
  const totalPayslips = filteredRecords.length;
  const totalPayrollSum = filteredRecords.reduce((acc, curr) => acc + curr.net_pay, 0);

  if (!isMounted || !sessionReady) {
    return (
      <div className="w-screen h-screen flex bg-[#04231b] overflow-hidden items-center justify-center text-white">
        <div className="animate-pulse text-center">
          <h1 className="text-xl font-bold">Mahardika Institute of Technology</h1>
          <p className="text-xs text-[#2baf9a] mt-1">Loading Payroll System...</p>
        </div>
      </div>
    );
  }

  // AUTH SCREEN
  if (!currentUser) {
    return (
      <div className="w-screen h-screen flex bg-[#04231b] overflow-hidden">
        {/* Left Panel */}
        <div className="flex-[1.2] relative bg-[url('/mit-school.jpg')] bg-cover bg-center p-14 flex flex-col justify-between text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a372b]/70 to-[#04231b]/80 z-10" />
          <div className="relative z-20 h-full flex flex-col justify-between">
            <div className="flex flex-col items-center gap-4 text-center">
              <Image src="/mit-seal.png" alt="Mahardika Institute of Technology seal" width={220} height={220} className="h-[220px] w-[220px] object-contain drop-shadow-xl rounded-full" referrerPolicy="no-referrer" />
              <div className="w-full max-w-2xl">
                <h1 className="font-serif text-2xl font-bold leading-tight tracking-tight text-white">Mahardika Institute of Technology, Inc.</h1>
                <p className="text-lg text-[#a3d9cb] uppercase tracking-widest font-semibold leading-relaxed mt-3">Web-Based Employee Payroll Management System</p>
              </div>
            </div>

            <p className="text-xs text-[#72a99b]">&copy; 2026 Mahardika Institute of Technology, Inc. All Rights Reserved.</p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 bg-white flex flex-col justify-center items-center p-12 overflow-y-auto">
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait">
              {authMode === 'login' ? (
                <motion.div
                  key="login-view"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-8">
                    <h3 className="text-3xl font-extrabold text-[#0f3b2c]">Sign In</h3>
                    <p className="text-sm text-emerald-800/70 mt-1">Enter your credentials to access your dashboard</p>
                  </div>

                  {loginStep === 'credentials' ? <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-[#0f3b2c] uppercase tracking-wider mb-2">Employee ID / Email</label>
                      <input
                        type="text"
                        className="w-full px-5 py-3.5 text-sm border-2 border-emerald-100 rounded-2xl bg-[#f5fbf9] focus:outline-none focus:border-[#2baf9a] focus:bg-white transition"
                        placeholder="e.g. EMP-2026-001 or admin@mit.edu.ph"
                        value={loginUser}
                        onChange={e => setLoginUser(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0f3b2c] uppercase tracking-wider mb-2">Password</label>
                      <input
                        type="password"
                        className="w-full px-5 py-3.5 text-sm border-2 border-emerald-100 rounded-2xl bg-[#f5fbf9] focus:outline-none focus:border-[#2baf9a] focus:bg-white transition"
                        placeholder="••••••••"
                        value={loginPass}
                        onChange={e => setLoginPass(e.target.value)}
                        required
                      />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full py-4 bg-[#0f3b2c] hover:bg-[#16523e] text-white font-bold rounded-full shadow-lg transition duration-200 mt-2 cursor-pointer"
                    >
                      Access Dashboard
                    </motion.button>
                  </form> : (
                    <form onSubmit={handleVerifyLoginOtp} className="space-y-5">
                      <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-sm text-emerald-900">
                        We sent a 6-digit security code to <strong>{loginOtpEmail}</strong>. A new code is required each time you sign in.
                        {loginOtpNotice && (
                          <div className="mt-2.5 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium leading-relaxed">
                            {loginOtpNotice}
                          </div>
                        )}
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        pattern="[0-9]{6}"
                        className="w-full px-5 py-3.5 text-center text-xl tracking-[0.4em] border-2 border-emerald-100 rounded-2xl bg-[#f5fbf9]"
                        placeholder="123456"
                        value={loginOtp}
                        onChange={e => setLoginOtp(e.target.value.replace(/\D/g, ''))}
                        required
                      />
                      <motion.button type="submit" className="w-full py-4 bg-[#0f3b2c] hover:bg-[#16523e] text-white font-bold rounded-full shadow-lg cursor-pointer">
                        Verify & Access Dashboard
                      </motion.button>
                    </form>
                  )}

                  <button onClick={() => { setAuthMode('forgot'); setForgotStep('request'); }} className="mt-4 w-full text-center text-sm text-[#2baf9a] font-bold hover:underline cursor-pointer">
                    Forgot password?
                  </button>

                  <div className="mt-6 text-center text-sm text-emerald-800/70">
                    Don&apos;t have an employee account?{' '}
                    <button onClick={() => setAuthMode('register')} className="text-[#2baf9a] font-bold hover:underline cursor-pointer">
                      Register Account
                    </button>
                  </div>
                </motion.div>
              ) : authMode === 'register' ? (
                <motion.div
                  key="register-view"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-6">
                    <h3 className="text-3xl font-extrabold text-[#0f3b2c]">Employee Registration</h3>
                    <p className="text-sm text-emerald-800/70 mt-1">Create an account to view and track your compensation records</p>
                  </div>

                  {registrationStep === 'form' ? (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0f3b2c] uppercase mb-1">Employee ID</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 text-sm border border-emerald-200 rounded-xl bg-[#f5fbf9]"
                        placeholder="Enter the exact ID issued by the school"
                        value={regData.employeeId}
                        onChange={e => setRegData({ ...regData, employeeId: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0f3b2c] uppercase mb-1">Full Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 text-sm border border-emerald-200 rounded-xl bg-[#f5fbf9]"
                        placeholder="e.g. Prof. Juan Dela Cruz"
                        value={regData.name}
                        onChange={e => setRegData({ ...regData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#0f3b2c] uppercase mb-1">Department</label>
                        <select
                          className="w-full px-3 py-3 text-sm border border-emerald-200 rounded-xl bg-[#f5fbf9]"
                          value={regData.department}
                          onChange={e => setRegData({ ...regData, department: e.target.value })}
                        >
                          {departments.map(department => <option key={department} value={department}>{department}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#0f3b2c] uppercase mb-1">Position</label>
                        <select
                          className="w-full px-3 py-3 text-sm border border-emerald-200 rounded-xl bg-[#f5fbf9]"
                          value={regData.position}
                          onChange={e => setRegData({ ...regData, position: e.target.value })}
                          required
                        >
                          {positions.map(position => <option key={position} value={position}>{position}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0f3b2c] uppercase mb-1">Email</label>
                      <input
                        type="email"
                        className="w-full px-4 py-3 text-sm border border-emerald-200 rounded-xl bg-[#f5fbf9]"
                        placeholder="name@mit.edu.ph"
                        value={regData.email}
                        onChange={e => setRegData({ ...regData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#0f3b2c] uppercase mb-1">Contact</label>
                        <input
                          type="text"
                          className="w-full px-3 py-3 text-sm border border-emerald-200 rounded-xl bg-[#f5fbf9]"
                          value={regData.contact}
                          onChange={e => setRegData({ ...regData, contact: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#0f3b2c] uppercase mb-1">Basic Salary</label>
                        <input
                          type="number"
                          className="w-full px-3 py-3 text-sm border border-emerald-200 rounded-xl bg-[#f5fbf9]"
                          value={regData.salary_rate}
                          onChange={e => setRegData({ ...regData, salary_rate: Number(e.target.value) })}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0f3b2c] uppercase mb-1">Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 text-sm border border-emerald-200 rounded-xl bg-[#f5fbf9]"
                        placeholder="••••••••"
                        value={regData.password}
                        onChange={e => setRegData({ ...regData, password: e.target.value })}
                        required
                      />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full py-3.5 bg-[#0f3b2c] hover:bg-[#16523e] text-white font-bold rounded-full shadow transition cursor-pointer"
                    >
                      Register Employee Account
                    </motion.button>
                  </form>
                  ) : registrationStep === 'otp' ? (
                    <form onSubmit={handleVerifyOtp} className="space-y-5">
                      <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-sm text-emerald-900">
                        We sent a 6-digit verification code to <strong>{pendingEmail}</strong>. The code expires in 10 minutes.
                        {regOtpNotice && (
                          <div className="mt-2.5 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium leading-relaxed">
                            {regOtpNotice}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#0f3b2c] uppercase mb-1">Verification Code</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={6}
                          pattern="[0-9]{6}"
                          className="w-full px-4 py-3 text-center text-xl tracking-[0.4em] border border-emerald-200 rounded-xl bg-[#f5fbf9]"
                          placeholder="123456"
                          value={otpCode}
                          onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          required
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full py-3.5 bg-[#0f3b2c] hover:bg-[#16523e] text-white font-bold rounded-full shadow transition cursor-pointer"
                      >
                        Verify Email & Create Account
                      </motion.button>
                    </form>
                  ) : (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-5 text-sm text-emerald-900 space-y-3">
                      <CheckCircle className="w-8 h-8 text-[#2baf9a]" />
                      <p className="font-bold">Email verified. Your account is awaiting admin or cashier approval.</p>
                      <p>You can sign in after your account has been approved.</p>
                    </div>
                  )}

                  <div className="mt-5 text-center text-sm text-emerald-800/70">
                    Already registered?{' '}
                    <button onClick={() => setAuthMode('login')} className="text-[#2baf9a] font-bold hover:underline cursor-pointer">
                      Sign In Here
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="forgot-password-view"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-6">
                    <h3 className="text-3xl font-extrabold text-[#0f3b2c]">Reset Password</h3>
                    <p className="text-sm text-emerald-800/70 mt-1">Use your institutional email to receive a verification code.</p>
                  </div>

                  {forgotStep === 'request' ? (
                    <form onSubmit={handleRequestPasswordReset} className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-[#0f3b2c] uppercase tracking-wider mb-2">Institutional Email</label>
                        <input
                          type="email"
                          className="w-full px-5 py-3.5 text-sm border-2 border-emerald-100 rounded-2xl bg-[#f5fbf9]"
                          placeholder="name@mit.edu.ph"
                          value={forgotEmail}
                          onChange={e => setForgotEmail(e.target.value)}
                          required
                        />
                      </div>
                      <motion.button type="submit" className="w-full py-4 bg-[#0f3b2c] hover:bg-[#16523e] text-white font-bold rounded-full shadow-lg cursor-pointer">
                        Send Reset Code
                      </motion.button>
                    </form>
                  ) : (
                    <form onSubmit={handleResetPassword} className="space-y-5">
                      <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-sm text-emerald-900">
                        Enter the 6-digit code sent to <strong>{forgotEmail}</strong>.
                        {forgotNotice && <div className="mt-2.5 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium leading-relaxed">{forgotNotice}</div>}
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        pattern="[0-9]{6}"
                        className="w-full px-5 py-3.5 text-center text-xl tracking-[0.4em] border-2 border-emerald-100 rounded-2xl bg-[#f5fbf9]"
                        placeholder="123456"
                        value={forgotOtp}
                        onChange={e => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                        required
                      />
                      <input
                        type="password"
                        minLength={6}
                        className="w-full px-5 py-3.5 text-sm border-2 border-emerald-100 rounded-2xl bg-[#f5fbf9]"
                        placeholder="New password"
                        value={forgotPassword}
                        onChange={e => setForgotPassword(e.target.value)}
                        required
                      />
                      <motion.button type="submit" className="w-full py-4 bg-[#0f3b2c] hover:bg-[#16523e] text-white font-bold rounded-full shadow-lg cursor-pointer">
                        Reset Password
                      </motion.button>
                    </form>
                  )}

                  <div className="mt-5 text-center text-sm text-emerald-800/70">
                    <button onClick={() => setAuthMode('login')} className="text-[#2baf9a] font-bold hover:underline cursor-pointer">
                      Back to Sign In
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  // MAIN DASHBOARD LAYOUT
  return (
    <div className="flex w-screen h-screen overflow-hidden bg-[#f5fbf9] text-[#0f3b2c]">
      {/* Sidebar */}
      <aside className="w-[280px] min-w-[280px] h-full bg-[#0f3e38] text-white flex flex-col justify-between shrink-0 z-30 shadow-xl">
        <div>
          {/* Logo Header */}
          <div className="p-8 flex items-center gap-3 border-b border-white/10">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden">
              <Image src="/mit-seal.png" alt="MIT" width={56} height={56} priority unoptimized className="object-contain" referrerPolicy="no-referrer" />
            </div>
            <div className="leading-tight">
              <h1 className="text-white font-bold text-sm uppercase tracking-wider">Mahardika</h1>
              <p className="text-[#2baf9a] text-[10px] font-semibold">Payroll System v2.0</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition cursor-pointer ${
                activeView === 'dashboard' ? 'bg-[#237a6b] text-white shadow-md font-bold' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Vault className="w-5 h-5 opacity-80" />
              <span>Dashboard</span>
            </button>

            {currentUser.role === 'admin' && (
              <>
                <button
                  onClick={() => setActiveView('employees')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition cursor-pointer ${
                    activeView === 'employees' ? 'bg-[#237a6b] text-white shadow-md font-bold' : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Users className="w-5 h-5 opacity-80" />
                  <span>Employees</span>
                </button>

                <button
                  onClick={() => setActiveView('process-payroll')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition cursor-pointer ${
                    activeView === 'process-payroll' ? 'bg-[#237a6b] text-white shadow-md font-bold' : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Calculator className="w-5 h-5 opacity-80" />
                  <span>Payroll Entry</span>
                </button>
              </>
            )}

            <button
              onClick={() => setActiveView('payroll-history')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition cursor-pointer ${
                activeView === 'payroll-history' ? 'bg-[#237a6b] text-white shadow-md font-bold' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className="w-5 h-5 opacity-80" />
              <span>Salary Records & Payslips</span>
            </button>

            <button
              onClick={() => setActiveView('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition cursor-pointer ${
                activeView === 'settings' ? 'bg-[#237a6b] text-white shadow-md font-bold' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <UserRound className="w-5 h-5 opacity-80" />
              <span>Account Settings</span>
            </button>

            {currentUser.role === 'admin' && (
              <button
                onClick={() => setActiveView('reports')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition cursor-pointer ${
                  activeView === 'reports' ? 'bg-[#237a6b] text-white shadow-md font-bold' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <FileSpreadsheet className="w-5 h-5 opacity-80" />
                <span>Reports</span>
              </button>
            )}

            
          </nav>
        </div>

        {/* User Profile Card */}
        <div className="p-6">
          <div className="bg-[#0a372b] p-4 rounded-2xl border border-white/5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              {currentUser.role === 'admin' ? (
                <div className="w-9 h-9 rounded-full border border-[#2baf9a] bg-white/10 flex items-center justify-center shrink-0">
                  <UserRound className="w-5 h-5 text-[#2baf9a]" aria-label="Cashier account" />
                </div>
              ) : currentUser.profile_pic ? (
                <Image src={currentUser.profile_pic} alt="User" width={36} height={36} className="rounded-full object-cover border border-[#2baf9a] shrink-0" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-9 h-9 rounded-full border border-[#2baf9a] bg-white/10 flex items-center justify-center shrink-0">
                  <UserRound className="w-5 h-5 text-[#2baf9a]" aria-label="Employee account" />
                </div>
              )}
              <div className="overflow-hidden">
                <p className="text-[10px] text-[#2baf9a] uppercase font-bold tracking-widest leading-none mb-1">
                  {currentUser.role === 'admin' ? 'Admin Account' : 'Faculty Member'}
                </p>
                <p className="text-sm text-white font-medium truncate">{currentUser.name}</p>
                <p className="text-xs text-white/40 truncate">{currentUser.position || (currentUser.role === 'admin' ? 'Finance Controller' : 'Instructor')}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="p-2 bg-white/10 hover:bg-red-600 rounded-lg text-white/60 hover:text-white transition shrink-0" title="Sign Out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto flex flex-col">
        {/* Header */}
        <header className="h-20 bg-gradient-to-r from-[#0f3e38] to-[#1a665a] flex items-center justify-between px-10 shadow-md shrink-0 text-white">
          <div>
            <h2 className="text-white font-bold text-xl tracking-tight">
              {activeView === 'dashboard' && 'Mahardika Institute of Technology, Inc.'}
              {activeView === 'employees' && 'Employee Directory'}
              {activeView === 'process-payroll' && 'Payroll Processing'}
              {activeView === 'payroll-history' && 'Salary Records & Payslips'}
              {activeView === 'reports' && 'Financial Reports'}
              {activeView === 'settings' && 'Account Settings'}
              {activeView === 'deliverables' && 'Source Code Deliverables'}
            </h2>
            <p className="text-[#2baf9a] text-xs font-medium">
              {activeView === 'dashboard' ? 'Web-Based Employee Payroll Management System' : `Welcome back, ${currentUser.name}`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {currentUser.role === 'admin' && (
              <button
                onClick={() => setActiveView('process-payroll')}
                className="px-6 py-2.5 bg-[#f1c40f] text-[#0f3b2c] font-bold text-sm rounded-full shadow-lg shadow-yellow-500/20 hover:bg-yellow-400 active:scale-95 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Payroll</span>
              </button>
            )}
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 p-8 space-y-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* VIEW: DASHBOARD */}
            {activeView === 'dashboard' && (
              <motion.div
                key="dashboard-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-6">
                  <motion.div whileHover={{ y: -3 }} className="bg-white rounded-[28px] p-6 shadow-sm border border-[#dcf1ec] flex flex-col">
                    <p className="text-[#2baf9a] text-[10px] uppercase font-bold tracking-wider">Total Employees</p>
                    <p className="text-3xl font-black mt-1 text-[#0f3b2c]">{totalEmployees}</p>
                    <p className="text-xs text-gray-400 mt-auto">Active Personnel</p>
                  </motion.div>

                  <motion.div whileHover={{ y: -3 }} className="bg-white rounded-[28px] p-6 shadow-sm border border-[#dcf1ec] flex flex-col">
                    <p className="text-[#2baf9a] text-[10px] uppercase font-bold tracking-wider">Total Payslips</p>
                    <p className="text-3xl font-black mt-1 text-[#0f3b2c]">{totalPayslips}</p>
                    <p className="text-xs text-gray-400 mt-auto">Disbursed Records</p>
                  </motion.div>

                  <motion.div whileHover={{ y: -3 }} className="bg-white rounded-[28px] p-6 shadow-sm border border-[#dcf1ec] flex flex-col">
                    <p className="text-[#2baf9a] text-[10px] uppercase font-bold tracking-wider">Disbursed Payroll</p>
                    <p className="text-3xl font-black mt-1 text-[#0f3b2c]">₱{(totalPayrollSum / 1000000).toFixed(2)}M</p>
                    <p className="text-xs text-gray-400 mt-auto">Current Cycle Total</p>
                  </motion.div>

                </div>

                {/* Employee Payroll Status Table */}
                <div className="bg-white rounded-[28px] shadow-sm border border-[#dcf1ec] flex-1 flex flex-col overflow-hidden">
                  <div className="px-8 py-5 border-b border-[#e2efe9] flex justify-between items-center bg-[#fcfdfd]">
                    <h3 className="font-bold text-[#0f3e38]">Employee Payroll Status</h3>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Search records..."
                        className="bg-[#eef7f4] border-0 rounded-full text-xs px-4 py-2 w-48 focus:ring-1 focus:ring-[#2baf9a] focus:outline-none"
                        value={empSearch}
                        onChange={e => setEmpSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-[#1f5e4a] text-white text-left">
                          <th className="px-8 py-4 font-semibold text-xs uppercase tracking-wider">Employee ID</th>
                          <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Name & Department</th>
                          <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Basic Salary</th>
                          <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Net Salary</th>
                          <th className="px-8 py-4 font-semibold text-xs uppercase tracking-wider text-center">Status</th>
                          <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {filteredRecords
                          .filter(p => p.name.toLowerCase().includes(empSearch.toLowerCase()) || p.employee_id.toLowerCase().includes(empSearch.toLowerCase()))
                          .map(p => (
                            <tr key={p.id} className="border-b border-[#e2efe9] hover:bg-[#f5fbf9] transition-colors">
                              <td className="px-8 py-4 font-mono font-bold text-[#2baf9a]">{p.employee_id}</td>
                              <td className="px-6 py-4">
                                <div className="font-bold text-[#0f3b2c]">{p.name}</div>
                                <div className="text-[10px] text-gray-500">{p.department}</div>
                              </td>
                              <td className="px-6 py-4 font-medium">₱{p.basic_salary.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                              <td className="px-6 py-4 font-bold text-[#0f3b2c]">₱{p.net_pay.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                              <td className="px-8 py-4 text-center">
                                <span className="bg-[#2baf9a]/10 text-[#2baf9a] text-[10px] px-3 py-1 rounded-full font-bold uppercase">PAID</span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleOpenPayslip(p)}
                                  className="p-2 rounded-lg bg-[#eef7f4] hover:bg-[#2baf9a] hover:text-white text-[#0f3b2c] transition cursor-pointer"
                                  title="View Electronic Payslip"
                                >
                                  <Eye className="w-4 h-4" />
                                </motion.button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW: EMPLOYEE DIRECTORY */}
            {activeView === 'employees' && (
              <motion.div
                key="employees-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-[28px] border border-[#dcf1ec] p-8 shadow-sm space-y-6"
              >
                <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#e2efe9] pb-5">
                  <div>
                    <h3 className="text-xl font-extrabold text-[#0f3e38]">Employee Directory</h3>
                    <p className="text-xs text-[#2baf9a] font-medium mt-0.5">Manage active personnel, positions, and salary rates</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search employees..."
                        className="pl-10 pr-4 py-2 bg-[#eef7f4] border-0 rounded-full text-xs w-56 focus:ring-1 focus:ring-[#2baf9a] focus:outline-none"
                        value={empSearch}
                        onChange={e => setEmpSearch(e.target.value)}
                      />
                    </div>
                    <select
                      aria-label="Sort employees"
                      className="px-3 py-2 bg-[#eef7f4] border-0 rounded-full text-xs focus:ring-1 focus:ring-[#2baf9a] focus:outline-none"
                      value={employeeSort}
                      onChange={e => setEmployeeSort(e.target.value as 'id' | 'name' | 'department')}
                    >
                      <option value="id">Sort by ID</option>
                      <option value="name">Sort A-Z</option>
                      <option value="department">Sort by Department</option>
                    </select>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setEditingEmpId(null);
                        setEmpModalForm({
                          id: '',
                          name: '',
                          department: departments[0],
                          position: positions[0],
                          contact: '09170000000',
                          email: '',
                          salary_rate: 30000,
                          role: 'employee'
                        });
                        setIsEmpModalOpen(true);
                      }}
                      className="px-6 py-2 bg-[#0f3e38] text-white rounded-full font-bold text-xs flex items-center gap-2 hover:bg-[#1f5e4a] transition shadow-sm cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4 text-[#f1c40f]" />
                      <span>Add Employee</span>
                    </motion.button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-[#e2efe9]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#1f5e4a] text-white text-xs uppercase font-semibold tracking-wider">
                        <th className="px-6 py-4">Employee Name </th>
                        <th className="px-6 py-4">Position</th>
                        <th className="px-6 py-4">Department</th>
                        <th className="px-6 py-4">Contact No.</th>
                        <th className="px-6 py-4">Email Address</th>
                        <th className="px-6 py-4">Base Rate</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {displayedEmployees.map(e => (
                          <tr key={e.id} className="border-b border-[#e2efe9] hover:bg-[#f5fbf9] transition-colors">
                            <td className="px-6 py-4 flex items-center gap-3">
                              <div className="w-[38px] h-[38px] rounded-full border border-[#2baf9a] bg-[#eef7f4] flex items-center justify-center shrink-0">
                                <UserRound className="w-5 h-5 text-[#2baf9a]" aria-label="Employee account" />
                              </div>
                              <div>
                                <div className="font-bold text-[#0f3b2c]">{e.name}</div>
                                <div className="text-xs font-mono font-bold text-[#2baf9a]">ID: {e.id}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-[#0f3b2c] font-medium">{e.position}</td>
                            <td className="px-6 py-4 text-gray-600">{e.department}</td>
                            <td className="px-6 py-4 text-xs text-[#0f3b2c]">{e.contact}</td>
                            <td className="px-6 py-4 text-xs text-gray-500">{e.email}</td>
                            <td className="px-6 py-4 font-bold text-[#0f3b2c]">₱{Number(e.salary_rate).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${e.role === 'admin' ? 'bg-[#2baf9a]/10 text-[#2baf9a]' : e.approved === false ? 'bg-amber-100 text-amber-800' : 'bg-[#eef7f4] text-[#0f3b2c]'}`}>
                                {e.role === 'admin' ? 'admin' : e.approved === false ? 'pending approval' : 'approved'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {e.role === 'employee' && e.approved === false && (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleApproveEmployee(e)}
                                    className="px-3 py-2 rounded-lg bg-amber-100 hover:bg-amber-500 hover:text-white text-amber-800 text-[10px] font-bold transition cursor-pointer"
                                    title="Approve Account"
                                  >
                                    Approve
                                  </motion.button>
                                )}
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => {
                                    setEditingEmpId(e.id);
                                    setEmpModalForm({ ...e });
                                    setIsEmpModalOpen(true);
                                  }}
                                  className="p-2 rounded-lg bg-[#eef7f4] hover:bg-[#2baf9a] hover:text-white text-[#0f3b2c] transition cursor-pointer"
                                  title="Edit Record"
                                >
                                  <PenSquare className="w-4 h-4" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleDownloadPayslip(e.id)}
                                  className="p-2 rounded-lg bg-[#eef7f4] hover:bg-[#2baf9a] hover:text-white text-[#0f3b2c] transition cursor-pointer"
                                  title="Download latest payslip"
                                >
                                  <Download className="w-4 h-4" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleDeleteEmployee(e.id)}
                                  className="p-2 rounded-lg bg-red-50 hover:bg-red-600 hover:text-white text-red-600 transition cursor-pointer"
                                  title="Delete Record"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </motion.button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* VIEW: PAYROLL ENTRY / PROCESSOR */}
            {activeView === 'process-payroll' && (
              <motion.div
                key="payroll-entry-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-[28px] border border-[#dcf1ec] p-8 shadow-sm space-y-6"
              >
                <div className="flex items-center justify-between border-b border-[#e2efe9] pb-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-[#0f3e38]">Payroll Entry</h3>
                    <p className="text-xs text-[#2baf9a] font-medium mt-0.5">Select employee profile, encode attendance inputs, and compute statutory deductions</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleResetPayrollForm}
                    type="button"
                    className="px-4 py-2 bg-[#eef7f4] hover:bg-[#2baf9a] hover:text-white text-[#0f3b2c] text-xs font-bold rounded-full transition flex items-center gap-1.5 cursor-pointer border border-emerald-200"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Form</span>
                  </motion.button>
                </div>

                <form onSubmit={handleSavePayroll} className="space-y-6">
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-[#0f3b2c] uppercase tracking-wider mb-2">Select Employee</label>
                      <select
                        className="w-full p-3 text-sm border border-[#dcf1ec] rounded-2xl bg-[#f5fbf9] focus:outline-none focus:ring-1 focus:ring-[#2baf9a]"
                        value={payrollForm.employee_id}
                        onChange={e => handleSelectPayrollEmp(e.target.value)}
                        required
                      >
                        <option value="">-- Choose Employee --</option>
                        {employees.filter(e => e.role === 'employee').map(e => (
                          <option key={e.id} value={e.id}>{e.name} ({e.id}) - {e.department}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0f3b2c] uppercase tracking-wider mb-2">Employee ID</label>
                      <input type="text" className="w-full p-3 text-sm border border-[#dcf1ec] rounded-2xl bg-[#eef7f4] font-mono font-bold text-[#2baf9a]" value={payrollForm.employee_id} readOnly />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0f3b2c] uppercase tracking-wider mb-2">From</label>
                      <input
                        type="date"
                        className="w-full p-3 text-sm border border-[#dcf1ec] rounded-2xl bg-[#eef7f4] text-[#0f3b2c]"
                        value={getPeriodStartInput(payrollForm.payroll_date)}
                        readOnly
                        aria-label="Payroll period start date"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0f3b2c] uppercase tracking-wider mb-2">To</label>
                      <input
                        type="date"
                        className="w-full p-3 text-sm border border-[#dcf1ec] rounded-2xl bg-[#f5fbf9] focus:outline-none focus:ring-1 focus:ring-[#2baf9a]"
                        value={payrollForm.payroll_date}
                        onChange={e => setPayrollForm({ ...payrollForm, payroll_date: e.target.value })}
                        required
                      />
                      <small className="text-[10px] text-gray-400">Selecting a date automatically sets a 15-day period.</small>
                    </div>
                  </div>

                  {/* EARNINGS */}
                  <div className="bg-[#f5fbf9] p-6 rounded-2xl border border-[#dcf1ec]">
                    <h4 className="text-sm font-bold text-[#0f3e38] mb-4 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-[#2baf9a]" />
                      <span>Basic Earnings & Allowances</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Basic Salary (₱)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full p-3 text-sm border border-[#dcf1ec] rounded-xl bg-white focus:ring-1 focus:ring-[#2baf9a]"
                          value={displayPayrollNumber(payrollForm.basic_salary)}
                          onChange={e => setPayrollForm({ ...payrollForm, basic_salary: Number(e.target.value) })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Allowance (₱)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full p-3 text-sm border border-[#dcf1ec] rounded-xl bg-white focus:ring-1 focus:ring-[#2baf9a]"
                          value={displayPayrollNumber(payrollForm.allowance)}
                          onChange={e => setPayrollForm({ ...payrollForm, allowance: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* DEDUCTIONS */}
                  <div className="bg-[#fff8f8] p-6 rounded-2xl border border-red-100">
                    <h4 className="text-sm font-bold text-red-800 mb-4 flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-red-600" />
                      <span>Attendance Absences & Mandatory Deductions</span>
                    </h4>
                    <div className="grid grid-cols-3 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Absences / Late (minutes)</label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          className="w-full p-3 text-sm border border-red-200 rounded-xl bg-white"
                          value={displayPayrollNumber(payrollForm.late_minutes)}
                          onChange={e => setPayrollForm({ ...payrollForm, late_minutes: Number(e.target.value) })}
                        />
                        <small className="text-[10px] text-gray-400">Deduction = basic salary / 30 / 8 / 60 x minutes</small>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Cash Advances (₱)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full p-3 text-sm border border-red-200 rounded-xl bg-white"
                          value={displayPayrollNumber(payrollForm.cash_advances)}
                          onChange={e => setPayrollForm({ ...payrollForm, cash_advances: Number(e.target.value) })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">SSS Premium Contribution (₱)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full p-3 text-sm border border-red-200 rounded-xl bg-white"
                          value={displayPayrollNumber(payrollForm.sss)}
                          onChange={e => setPayrollForm({ ...payrollForm, sss: Number(e.target.value) })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">PHIC Premium Contribution (₱)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full p-3 text-sm border border-red-200 rounded-xl bg-white"
                          value={displayPayrollNumber(payrollForm.phic)}
                          onChange={e => setPayrollForm({ ...payrollForm, phic: Number(e.target.value) })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">PAg-IBIG Premium Contribution (₱)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full p-3 text-sm border border-red-200 rounded-xl bg-white"
                          value={displayPayrollNumber(payrollForm.pagibig)}
                          onChange={e => setPayrollForm({ ...payrollForm, pagibig: Number(e.target.value) })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Loan: SSS (₱)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full p-3 text-sm border border-red-200 rounded-xl bg-white"
                          value={displayPayrollNumber(payrollForm.loan_sss)}
                          onChange={e => setPayrollForm({ ...payrollForm, loan_sss: Number(e.target.value) })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Loan: Pag-IBIG (₱)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full p-3 text-sm border border-red-200 rounded-xl bg-white"
                          value={displayPayrollNumber(payrollForm.loan_pagibig)}
                          onChange={e => setPayrollForm({ ...payrollForm, loan_pagibig: Number(e.target.value) })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Wtax (₱)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full p-3 text-sm border border-red-200 rounded-xl bg-white"
                          value={displayPayrollNumber(payrollForm.wtax)}
                          onChange={e => setPayrollForm({ ...payrollForm, wtax: Number(e.target.value) })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Other Deductions (₱)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full p-3 text-sm border border-red-200 rounded-xl bg-white"
                          value={displayPayrollNumber(payrollForm.other_deductions)}
                          onChange={e => setPayrollForm({ ...payrollForm, other_deductions: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* AUTOMATED SUMMARY DISPLAY */}
                  <div className="bg-[#0f3e38] text-white p-6 rounded-2xl grid grid-cols-3 gap-6 items-center shadow-lg">
                    <div>
                      <div className="text-[10px] font-bold text-[#2baf9a] uppercase tracking-wider">Gross Salary</div>
                      <div className="text-2xl font-black mt-1">₱{calcGross.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-red-300 uppercase tracking-wider">Total Deductions</div>
                      <div className="text-2xl font-black text-red-300 mt-1">₱{calcDeductions.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-[#f1c40f] uppercase tracking-wider">Net Salary</div>
                      <div className="text-3xl font-black text-[#f1c40f] mt-1">₱{calcNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      type="submit"
                      className="px-8 py-3.5 bg-[#f1c40f] text-[#0f3b2c] font-extrabold rounded-full shadow-lg shadow-yellow-500/20 hover:bg-yellow-400 transition flex items-center gap-2 cursor-pointer"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Save & Generate Payslip</span>
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* VIEW: PAYROLL HISTORY & PAYSLIPS */}
            {activeView === 'payroll-history' && (
              <motion.div
                key="payroll-history-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-[28px] border border-[#dcf1ec] p-8 shadow-sm space-y-6"
              >
                <div className="flex items-center justify-between border-b border-[#e2efe9] pb-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-[#0f3e38]">Salary Records & Payslips</h3>
                    <p className="text-xs text-[#2baf9a] font-medium mt-0.5">Historical disbursement log and electronic payslip issuance</p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    <select
                      aria-label="Payroll date sort"
                      className="px-3 py-2 bg-[#eef7f4] border-0 rounded-full text-xs focus:ring-1 focus:ring-[#2baf9a] focus:outline-none"
                      value={payrollSort}
                      onChange={e => setPayrollSort(e.target.value as 'new-old' | 'old-new')}
                    >
                      <option value="new-old">New-Old</option>
                      <option value="old-new">Old-New</option>
                    </select>
                    <input
                      type="month"
                      aria-label="Filter payroll by month"
                      className="px-3 py-2 bg-[#eef7f4] border-0 rounded-full text-xs focus:ring-1 focus:ring-[#2baf9a] focus:outline-none"
                      value={payrollMonth}
                      onChange={e => setPayrollMonth(e.target.value)}
                    />
                    <input
                      type="number"
                      min="2000"
                      max="2100"
                      placeholder="Year"
                      aria-label="Filter payroll by year"
                      className="w-20 px-3 py-2 bg-[#eef7f4] border-0 rounded-full text-xs focus:ring-1 focus:ring-[#2baf9a] focus:outline-none"
                      value={payrollYear}
                      onChange={e => setPayrollYear(e.target.value)}
                    />
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-[#e2efe9]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#1f5e4a] text-white text-xs uppercase font-semibold tracking-wider">
                        <th className="px-6 py-4">Employee ID No.</th>
                        <th className="px-6 py-4">Employee's Name</th>
                        <th className="px-6 py-4">Department</th>
                        <th className="px-6 py-4">Basic Salary</th>
                        <th className="px-6 py-4">Allowance</th>
                        <th className="px-6 py-4">Gross Pay</th>
                        <th className="px-6 py-4">Deductions</th>
                        <th className="px-6 py-4">Net Pay</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-center">Payslip</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {displayedPayrollRecords.map(p => (
                        <tr key={p.id} className="border-b border-[#e2efe9] hover:bg-[#f5fbf9] transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-[#2baf9a]">{p.employee_id}</td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-[#0f3b2c]">{p.name}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{p.department}</td>
                          <td className="px-6 py-4 font-medium">₱{p.basic_salary.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="px-6 py-4 text-[#2baf9a] font-medium">+₱{p.allowance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="px-6 py-4 font-medium">₱{p.gross_pay.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="px-6 py-4 text-red-600 font-medium">-₱{p.total_deduction.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="px-6 py-4 font-extrabold text-[#0f3b2c]">₱{p.net_pay.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="px-6 py-4 text-gray-500 text-xs">{p.payroll_date}</td>
                          <td className="px-6 py-4 text-center">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleOpenPayslip(p)}
                              className="p-2 bg-[#eef7f4] hover:bg-[#2baf9a] hover:text-white text-[#0f3b2c] rounded-xl transition cursor-pointer"
                              title="Print Electronic Payslip"
                            >
                              <Printer className="w-4 h-4" />
                            </motion.button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* VIEW: REPORTS */}
            {activeView === 'reports' && (
              <motion.div
                key="reports-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-[28px] border border-[#dcf1ec] p-8 shadow-sm space-y-6"
              >
                <div className="flex items-center justify-between border-b border-[#e2efe9] pb-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-[#0f3e38]">Financial Reports</h3>
                    <p className="text-xs text-[#2baf9a] font-medium mt-0.5">Institutional payroll expense totals, statutory contributions, and net disbursements</p>
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => window.print()}
                      className="px-6 py-2.5 bg-[#0f3e38] text-white font-bold text-xs rounded-full flex items-center gap-2 hover:bg-[#1f5e4a] transition shadow-sm cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-[#f1c40f]" />
                      <span>Print Summary Report</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={exportExcelCSV}
                      className="px-6 py-2.5 bg-[#237a6b] text-white font-bold text-xs rounded-full flex items-center gap-2 hover:bg-[#1f5e4a] transition shadow-sm cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Export Excel</span>
                    </motion.button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-[#f5fbf9] p-6 rounded-2xl border border-[#dcf1ec]">
                    <div className="text-[10px] font-bold text-[#2baf9a] uppercase tracking-wider">Total Gross Disbursements</div>
                    <div className="text-2xl font-black text-[#0f3b2c] mt-1">
                      ₱{payrollRecords.reduce((a, b) => a + b.gross_pay, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="bg-[#f5fbf9] p-6 rounded-2xl border border-[#dcf1ec]">
                    <div className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Total Statutory Deductions</div>
                    <div className="text-2xl font-black text-red-600 mt-1">
                      ₱{payrollRecords.reduce((a, b) => a + b.total_deduction, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="bg-[#f5fbf9] p-6 rounded-2xl border border-[#dcf1ec]">
                    <div className="text-[10px] font-bold text-[#237a6b] uppercase tracking-wider">Total Net Salary Expense</div>
                    <div className="text-2xl font-black text-[#237a6b] mt-1">
                      ₱{payrollRecords.reduce((a, b) => a + b.net_pay, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-[#e2efe9]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#1f5e4a] text-white text-xs uppercase font-semibold tracking-wider">
                        <th className="px-6 py-4">Employee ID No.</th>
                        <th className="px-6 py-4">Employee's Name</th>
                        <th className="px-6 py-4">Department</th>
                        <th className="px-6 py-4">Basic Salary</th>
                        <th className="px-6 py-4">Allowance</th>
                        <th className="px-6 py-4">Gross Pay</th>
                        <th className="px-6 py-4">Deductions</th>
                        <th className="px-6 py-4">Net Pay</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-center">Payslip</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {displayedPayrollRecords.map(p => (
                        <tr key={p.id} className="border-b border-[#e2efe9] hover:bg-[#f5fbf9] transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-[#2baf9a]">{p.employee_id}</td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-[#0f3b2c]">{p.name}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{p.department}</td>
                          <td className="px-6 py-4 font-medium">₱{p.basic_salary.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="px-6 py-4 text-[#2baf9a] font-medium">+₱{p.allowance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="px-6 py-4 font-medium">₱{p.gross_pay.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="px-6 py-4 text-red-600 font-medium">-₱{p.total_deduction.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="px-6 py-4 font-extrabold text-[#0f3b2c]">₱{p.net_pay.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="px-6 py-4 text-gray-500 text-xs">{p.payroll_date}</td>
                          <td className="px-6 py-4 text-center">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleOpenPayslip(p)}
                              className="p-2 bg-[#eef7f4] hover:bg-[#2baf9a] hover:text-white text-[#0f3b2c] rounded-xl transition cursor-pointer"
                              title="Print Electronic Payslip"
                            >
                              <Printer className="w-4 h-4" />
                            </motion.button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* VIEW: ACCOUNT SETTINGS */}
            {activeView === 'settings' && (
              <motion.div
                key="settings-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-[28px] border border-[#dcf1ec] p-8 shadow-sm space-y-6"
              >
                <div className="border-b border-[#e2efe9] pb-5">
                  <h3 className="text-xl font-extrabold text-[#0f3e38]">Account Settings</h3>
                  <p className="text-xs text-[#2baf9a] font-medium mt-0.5">Update your profile details and picture</p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#2baf9a] bg-[#eef7f4] shrink-0">
                      {profileForm.profile_pic ? (
                        <img src={profileForm.profile_pic} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <UserRound className="w-9 h-9 m-4 text-[#2baf9a]" />
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0f3b2c] uppercase mb-2">Profile Picture</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => setProfilePhoto(e.target.files?.[0] || null)}
                        className="block w-full text-xs text-gray-600 file:mr-3 file:rounded-full file:border-0 file:bg-[#0f3e38] file:px-4 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-[#1f5e4a]"
                      />
                      <p className="text-[11px] text-gray-400 mt-2">Large images are automatically compressed before upload.</p>
                      {profilePhoto && <p className="text-[11px] text-[#2baf9a] mt-1">Selected: {profilePhoto.name}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Full Name</label>
                      <input
                        type="text"
                        className="w-full p-3 text-sm border border-[#dcf1ec] rounded-xl bg-[#f5fbf9]"
                        value={profileForm.name}
                        onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Position</label>
                      <input
                        type="text"
                        className="w-full p-3 text-sm border border-[#dcf1ec] rounded-xl bg-[#f5fbf9]"
                        value={profileForm.position}
                        onChange={e => setProfileForm({ ...profileForm, position: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Department</label>
                    <select
                      className="w-full p-3 text-sm border border-[#dcf1ec] rounded-xl bg-[#f5fbf9]"
                      value={profileForm.department}
                      onChange={e => setProfileForm({ ...profileForm, department: e.target.value })}
                      required
                    >
                      {departments.map(department => <option key={department} value={department}>{department}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Email</label>
                      <input type="email" value={currentUser.email} readOnly className="w-full p-3 text-sm border border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Phone Number</label>
                      <input type="text" value={currentUser.contact} readOnly className="w-full p-3 text-sm border border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Password</label>
                    <input type="password" value="********" readOnly className="w-full p-3 text-sm border border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed" />
                    <p className="text-[11px] text-gray-400 mt-1">Use Forgot Password from the sign-in screen to change it.</p>
                  </div>

                  {profileMessage && <p className="text-sm font-semibold text-[#237a6b]">{profileMessage}</p>}
                  <div className="flex justify-end">
                    <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-7 py-3 bg-[#0f3e38] text-white rounded-full font-bold text-sm hover:bg-[#1f5e4a] transition cursor-pointer">
                      Save Profile
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* VIEW: SOURCE DELIVERABLES INSPECTOR */}
            {activeView === 'deliverables' && (
              <motion.div
                key="deliverables-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-[28px] border border-[#dcf1ec] p-8 shadow-sm space-y-6"
              >
                <div>
                  <h3 className="text-xl font-extrabold text-[#0f3e38]">Source Code Deliverables</h3>
                  <p className="text-xs text-[#2baf9a] font-medium mt-0.5">Inspect or copy the standalone PHP (PDO), MySQL, and HTML/CSS/JS source files</p>
                </div>

                <div className="flex gap-2 border-b border-[#e2efe9] pb-3 overflow-x-auto">
                  {(['database.sql', 'api.php', 'db.php', 'index.html', 'style.css', 'script.js'] as const).map(file => (
                    <button
                      key={file}
                      onClick={() => setDeliverableFile(file)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                        deliverableFile === file ? 'bg-[#0f3e38] text-white shadow' : 'bg-[#eef7f4] text-[#0f3b2c] hover:bg-[#2baf9a] hover:text-white'
                      }`}
                    >
                      <Code className="w-3.5 h-3.5" />
                      <span>{file}</span>
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <div className="absolute right-4 top-4 flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCopyCode}
                      className="px-4 py-2 bg-[#2baf9a] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-[#1f5e4a] transition shadow-sm cursor-pointer"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-amber-300" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Copied!' : 'Copy File'}</span>
                    </motion.button>
                  </div>
                  <pre className="bg-[#05261d] text-[#c4e3dc] p-6 rounded-2xl overflow-x-auto text-xs font-mono max-h-[500px]">
                    <code>{sourceCodeText}</code>
                  </pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* MODAL: ADD / EDIT EMPLOYEE */}
      <AnimatePresence>
        {isEmpModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEmpModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative z-10 bg-white w-full max-w-xl rounded-[28px] overflow-hidden shadow-2xl border border-[#dcf1ec]"
            >
              <div className="bg-[#0f3e38] text-white p-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-extrabold">{editingEmpId ? 'Edit Employee Profile' : 'Add New Employee'}</h3>
                  <p className="text-xs text-[#2baf9a] font-medium">Mahardika Institute Personnel Management</p>
                </div>
                <button onClick={() => setIsEmpModalOpen(false)} className="text-white/80 hover:text-white text-2xl font-bold cursor-pointer">&times;</button>
              </div>

              <form onSubmit={handleSaveEmployee} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Employee ID</label>
                    <input
                      type="text"
                      className="w-full p-3 text-sm border border-[#dcf1ec] rounded-xl bg-[#f5fbf9] focus:outline-none focus:ring-1 focus:ring-[#2baf9a]"
                        placeholder="Enter exact school employee ID"
                        value={empModalForm.id}
                      onChange={e => setEmpModalForm({ ...empModalForm, id: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      className="w-full p-3 text-sm border border-[#dcf1ec] rounded-xl bg-[#f5fbf9] focus:outline-none focus:ring-1 focus:ring-[#2baf9a]"
                      value={empModalForm.name}
                      onChange={e => setEmpModalForm({ ...empModalForm, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Department</label>
                    <select
                      className="w-full p-3 text-sm border border-[#dcf1ec] rounded-xl bg-[#f5fbf9] focus:outline-none focus:ring-1 focus:ring-[#2baf9a]"
                      value={empModalForm.department}
                      onChange={e => setEmpModalForm({ ...empModalForm, department: e.target.value })}
                      required
                    >
                      {departments.map(department => <option key={department} value={department}>{department}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Position</label>
                    <select
                      className="w-full p-3 text-sm border border-[#dcf1ec] rounded-xl bg-[#f5fbf9] focus:outline-none focus:ring-1 focus:ring-[#2baf9a]"
                      value={empModalForm.position}
                      onChange={e => setEmpModalForm({ ...empModalForm, position: e.target.value })}
                      required
                    >
                      {positions.map(position => <option key={position} value={position}>{position}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Contact Number</label>
                    <input
                      type="text"
                      className="w-full p-3 text-sm border border-[#dcf1ec] rounded-xl bg-[#f5fbf9] focus:outline-none focus:ring-1 focus:ring-[#2baf9a]"
                      value={empModalForm.contact}
                      onChange={e => setEmpModalForm({ ...empModalForm, contact: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      className="w-full p-3 text-sm border border-[#dcf1ec] rounded-xl bg-[#f5fbf9] focus:outline-none focus:ring-1 focus:ring-[#2baf9a]"
                      value={empModalForm.email}
                      onChange={e => setEmpModalForm({ ...empModalForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Basic Salary (₱)</label>
                    <input
                      type="number"
                      className="w-full p-3 text-sm border border-[#dcf1ec] rounded-xl bg-[#f5fbf9] focus:outline-none focus:ring-1 focus:ring-[#2baf9a]"
                      value={empModalForm.salary_rate}
                      onChange={e => setEmpModalForm({ ...empModalForm, salary_rate: Number(e.target.value) })}
                      required
                    />
                  </div>
                  
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#e2efe9]">
                  <button type="button" onClick={() => setIsEmpModalOpen(false)} className="px-6 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 cursor-pointer">
                    Cancel
                  </button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="px-6 py-2.5 text-xs font-bold text-white bg-[#0f3e38] rounded-full hover:bg-[#1f5e4a] cursor-pointer shadow-sm">
                    Save Employee Profile
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: VIEW ELECTRONIC PAYSLIP */}
      <AnimatePresence>
        {selectedPayslip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPayslip(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm no-print"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="payslip-modal relative z-10 bg-white w-full max-w-2xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-[28px] shadow-2xl border border-[#dcf1ec]"
            >
              <div className="bg-[#0f3e38] text-white p-5 flex justify-between items-center no-print">
                <div>
                  <h3 className="font-extrabold text-base">PAYSLIP</h3>
                  <p className="text-xs text-[#2baf9a]">Mahardika Institute of Technology, Inc.</p>
                </div>
                <button onClick={() => setSelectedPayslip(null)} className="text-white/80 hover:text-white text-2xl font-bold cursor-pointer">&times;</button>
              </div>

              <div className={`payslip-print-area bg-white payslip-copies-${payslipCopies}`}>
                {Array.from({ length: payslipCopies }, (_, copyIndex) => (
                  <PayslipCopy key={copyIndex} record={selectedPayslip} />
                ))}
              </div>

              <div className="p-4 bg-[#f5fbf9] border-t border-[#e2efe9] flex justify-end gap-3 no-print">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handlePrintPayslip(1)}
                  className="px-6 py-2.5 bg-[#0f3e38] hover:bg-[#1f5e4a] text-white font-bold text-xs rounded-full flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4 text-[#f1c40f]" />
                  <span>Print 1 Copy</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handlePrintPayslip(2)}
                  className="px-6 py-2.5 bg-[#237a6b] hover:bg-[#1f5e4a] text-white font-bold text-xs rounded-full flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4 text-[#f1c40f]" />
                  <span>Print 2 Copies</span>
                </motion.button>
                <button
                  onClick={() => setSelectedPayslip(null)}
                  className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs rounded-full cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
