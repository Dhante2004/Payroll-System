import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createHash, randomInt, randomUUID } from 'crypto';
import { clearSessionCookie, getDatabase, getSessionUser, setSessionCookie, toEmployee } from '@/lib/auth';

export const runtime = 'nodejs';

const otpLifetimeMs = 10 * 60 * 1000;
const hardcodedAdmin = {
  userId: 'hardcoded-admin-001',
  id: 'Admin001',
  name: 'Cashier',
  position: 'Cashier',
  department: 'Finance & HR',
  contact: '09171234567',
  email: 'admin@mit.edu.ph',
  salary_rate: 65000,
  role: 'admin' as const,
  approved: true,
  profile_pic: undefined
};

function toAccountEmployee(employee: Record<string, unknown>) {
  const normalized = toEmployee(employee);
  return employee.role === 'admin'
    ? { ...normalized, name: 'Cashier', position: 'Cashier', profile_pic: undefined }
    : normalized;
}

function isHardcodedAdminLogin(login: string) {
  return login === hardcodedAdmin.id || login.toLowerCase() === hardcodedAdmin.email;
}

function hashOtp(code: string) {
  return createHash('sha256').update(code).digest('hex');
}

async function sendOtpEmail(email: string, code: string) {
  const agentMailApiKey = process.env.AGENTMAIL_API_KEY;
  const agentMailInboxId = process.env.AGENTMAIL_INBOX_ID;
  if (agentMailApiKey && agentMailInboxId) {
    const response = await fetch(`https://api.agentmail.to/v0/inboxes/${encodeURIComponent(agentMailInboxId)}/messages/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${agentMailApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: email,
        subject: 'Your MIT payroll verification code',
        text: `Your verification code is ${code}. It expires in 10 minutes. If you did not request this code, you can ignore this email.`
      })
    });
    if (!response.ok) {
      const details = await response.text();
      throw new Error(`AgentMail rejected the OTP email (${response.status}). ${details.slice(0, 300)}`);
    }
    return true;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.OTP_FROM_EMAIL || 'onboarding@resend.dev';
  if (!apiKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Email OTP is not configured. Add RESEND_API_KEY to the server environment.');
    }
    return false;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: 'Your MIT payroll verification code',
      text: `Your verification code is ${code}. It expires in 10 minutes. If you did not create an account, you can ignore this email.`
    })
  });

  if (!response.ok) {
    throw new Error('The verification email could not be sent. Check the email service configuration.');
  }
  return true;
}

export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ user: null });

  const database = await getDatabase();
  const employee = await database.collection('employees').findOne({ userId: session.userId });
  if (!employee) {
    const response = NextResponse.json({ user: null });
    clearSessionCookie(response);
    return response;
  }
  return NextResponse.json({ user: toAccountEmployee(employee) });
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ status: 'error', message: 'Invalid request body.' }, { status: 400 });
  }
  const action = body.action as string;
  let database: Awaited<ReturnType<typeof getDatabase>>;
  try {
    database = await getDatabase();
  } catch (error) {
    console.error('Database connection failed:', error);
    return NextResponse.json({
      status: 'error',
      message: 'The database is unavailable. Check the MONGODB_URI and Atlas network access settings.'
    }, { status: 503 });
  }
  const employees = database.collection('employees');

  if (action === 'logout') {
    const response = NextResponse.json({ status: 'success' });
    clearSessionCookie(response);
    return response;
  }

  if (action === 'forgot-password') {
    const email = String(body.email || '').trim().toLowerCase();
    const employee = email ? await employees.findOne({ email }) : null;
    let devCode: string | undefined;
    if (employee) {
      const otp = String(randomInt(100000, 1000000));
      const passwordResets = database.collection('passwordResets');
      await passwordResets.deleteMany({ userId: String(employee.userId) });
      try {
        const deliveredByEmail = await sendOtpEmail(String(employee.email), otp);
        if (!deliveredByEmail) devCode = otp;
      } catch (error) {
        return NextResponse.json({
          status: 'error',
          message: error instanceof Error ? error.message : 'Unable to send the password reset code.'
        }, { status: 503 });
      }
      await passwordResets.insertOne({
        userId: String(employee.userId),
        email: String(employee.email),
        otpHash: hashOtp(otp),
        otpExpiresAt: new Date(Date.now() + otpLifetimeMs),
        otpAttempts: 0,
        createdAt: new Date()
      });
    }
    return NextResponse.json({
      status: 'pending',
      email,
      ...(devCode ? { devCode, testNotice: 'Email delivery is disabled locally. Use the development code shown here.' } : {})
    });
  }

  if (action === 'reset-password') {
    const email = String(body.email || '').trim().toLowerCase();
    const code = String(body.code || '').trim();
    const newPassword = String(body.newPassword || '');
    if (!email || !/^\d{6}$/.test(code) || newPassword.length < 6) {
      return NextResponse.json({ status: 'error', message: 'Enter the 6-digit code and a password of at least 6 characters.' }, { status: 400 });
    }
    const employee = await employees.findOne({ email });
    const passwordResets = database.collection('passwordResets');
    const reset = employee ? await passwordResets.findOne({ userId: String(employee.userId), email }) : null;
    if (!employee || !reset || !(reset.otpExpiresAt instanceof Date) || reset.otpExpiresAt.getTime() < Date.now()) {
      return NextResponse.json({ status: 'error', message: 'That code has expired. Please request a new one.' }, { status: 400 });
    }
    if (Number(reset.otpAttempts || 0) >= 5) {
      return NextResponse.json({ status: 'error', message: 'Too many incorrect attempts. Please request a new code.' }, { status: 429 });
    }
    if (reset.otpHash !== hashOtp(code)) {
      await passwordResets.updateOne({ _id: reset._id }, { $inc: { otpAttempts: 1 } });
      return NextResponse.json({ status: 'error', message: 'That verification code is incorrect.' }, { status: 400 });
    }
    await employees.updateOne({ _id: employee._id }, { $set: { passwordHash: await bcrypt.hash(newPassword, 12) } });
    await passwordResets.deleteOne({ _id: reset._id });
    return NextResponse.json({ status: 'success' });
  }

  if (action === 'login') {
    const login = String(body.login || body.email || '').trim();
    const password = String(body.password || '');
    const storedEmployee = await employees.findOne({
      $or: [{ email: login.toLowerCase() }, { id: login }]
    });
    const isValidHardcodedAdmin = isHardcodedAdminLogin(login) && password === 'admin123';
    if (!storedEmployee && !isValidHardcodedAdmin) {
      return NextResponse.json({ status: 'error', message: 'Invalid email or password.' }, { status: 401 });
    }
    const employee = storedEmployee || hardcodedAdmin;
    if (storedEmployee && !(await bcrypt.compare(password, String(storedEmployee.passwordHash)))) {
      return NextResponse.json({ status: 'error', message: 'Invalid email or password.' }, { status: 401 });
    }
    if (employee.role !== 'admin' && employee.approved === false) {
      return NextResponse.json({ status: 'error', message: 'Your account is waiting for admin or cashier approval.' }, { status: 403 });
    }
    if (employee.role === 'admin') {
      const user = {
        userId: String(employee.userId),
        employeeId: String(employee.id),
        role: 'admin' as const,
        email: String(employee.email)
      };
      const response = NextResponse.json({ status: 'success', user: toAccountEmployee(employee) });
      setSessionCookie(response, user);
      return response;
    }

    const otp = String(randomInt(100000, 1000000));
    const loginOtps = database.collection('loginOtps');
    await loginOtps.deleteMany({ userId: String(employee.userId) });
    let devCode: string | undefined;
    try {
      const deliveredByEmail = await sendOtpEmail(String(employee.email), otp);
      if (!deliveredByEmail) devCode = otp;
    } catch (error) {
      return NextResponse.json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unable to send the login verification code.'
      }, { status: 503 });
    }
    await loginOtps.insertOne({
      userId: String(employee.userId),
      email: String(employee.email),
      otpHash: hashOtp(otp),
      otpExpiresAt: new Date(Date.now() + otpLifetimeMs),
      otpAttempts: 0,
      createdAt: new Date()
    });
    return NextResponse.json({
      status: 'pending-login',
      email: String(employee.email),
      ...(devCode ? { devCode, testNotice: 'Email delivery is disabled locally. Use the development code shown here.' } : {})
    });
  }

  if (action === 'verify-login-otp') {
    const email = String(body.email || '').trim().toLowerCase();
    const code = String(body.code || '').trim();
    if (!email || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ status: 'error', message: 'Enter the 6-digit verification code.' }, { status: 400 });
    }
    const employee = (await employees.findOne({ email })) || (email === hardcodedAdmin.email ? hardcodedAdmin : null);
    const loginOtps = database.collection('loginOtps');
    const loginOtp = employee ? await loginOtps.findOne({ userId: String(employee.userId), email }) : null;
    if (!employee || (employee.role !== 'admin' && employee.approved === false)) {
      return NextResponse.json({ status: 'error', message: 'Your account is waiting for admin or cashier approval.' }, { status: 403 });
    }
    if (!loginOtp || !(loginOtp.otpExpiresAt instanceof Date) || loginOtp.otpExpiresAt.getTime() < Date.now()) {
      return NextResponse.json({ status: 'error', message: 'That code has expired. Please sign in again.' }, { status: 400 });
    }
    if (Number(loginOtp.otpAttempts || 0) >= 5) {
      return NextResponse.json({ status: 'error', message: 'Too many incorrect attempts. Please sign in again.' }, { status: 429 });
    }
    if (loginOtp.otpHash !== hashOtp(code)) {
      await loginOtps.updateOne({ _id: loginOtp._id }, { $inc: { otpAttempts: 1 } });
      return NextResponse.json({ status: 'error', message: 'That verification code is incorrect.' }, { status: 400 });
    }
    await loginOtps.deleteOne({ _id: loginOtp._id });

    const user = {
      userId: String(employee.userId),
      employeeId: String(employee.id),
      role: employee.role as 'admin' | 'employee',
      email: String(employee.email)
    };
    const response = NextResponse.json({ status: 'success', user: toAccountEmployee(employee) });
    setSessionCookie(response, user);
    return response;
  }

  if (action === 'register') {
    const employeeId = String(body.employeeId || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    if (!employeeId || !email || password.length < 6 || !body.name) {
      return NextResponse.json({ status: 'error', message: 'School employee ID, name, email, and a password of at least 6 characters are required.' }, { status: 400 });
    }
    if (await employees.findOne({ $or: [{ email }, { id: employeeId }] })) {
      return NextResponse.json({ status: 'error', message: 'That employee ID or email is already registered.' }, { status: 409 });
    }

    const otp = String(randomInt(100000, 1000000));
    const pendingRegistrations = database.collection('pendingRegistrations');
    let devCode: string | undefined;
    const pendingRegistration = {
      userId: randomUUID(),
      id: employeeId,
      name: String(body.name),
      position: String(body.position || 'Faculty Member'),
      department: String(body.department || 'General Education'),
      contact: String(body.contact || ''),
      email,
      passwordHash: await bcrypt.hash(password, 12),
      salary_rate: Number(body.salary_rate) || 25000,
      otpHash: hashOtp(otp),
      otpExpiresAt: new Date(Date.now() + otpLifetimeMs),
      otpAttempts: 0,
      createdAt: new Date()
    };

    try {
      const deliveredByEmail = await sendOtpEmail(email, otp);
      if (!deliveredByEmail) devCode = otp;
      await pendingRegistrations.deleteMany({ $or: [{ email }, { id: employeeId }] });
      await pendingRegistrations.insertOne(pendingRegistration);
    } catch (error) {
      return NextResponse.json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unable to send the verification code.'
      }, { status: 503 });
    }

    return NextResponse.json({
      status: 'pending',
      email,
      ...(devCode ? { devCode, testNotice: 'Email delivery is disabled locally. Use the development code shown here.' } : {})
    });
  }

  if (action === 'verify-otp') {
    const email = String(body.email || '').trim().toLowerCase();
    const code = String(body.code || '').trim();
    if (!email || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ status: 'error', message: 'Enter the 6-digit verification code.' }, { status: 400 });
    }

    const pendingRegistrations = database.collection('pendingRegistrations');
    const pending = await pendingRegistrations.findOne({ email });
    if (!pending || !(pending.otpExpiresAt instanceof Date) || pending.otpExpiresAt.getTime() < Date.now()) {
      return NextResponse.json({ status: 'error', message: 'That code has expired. Please register again.' }, { status: 400 });
    }
    if (Number(pending.otpAttempts || 0) >= 5) {
      return NextResponse.json({ status: 'error', message: 'Too many incorrect attempts. Please register again.' }, { status: 429 });
    }
    if (pending.otpHash !== hashOtp(code)) {
      await pendingRegistrations.updateOne({ _id: pending._id }, { $inc: { otpAttempts: 1 } });
      return NextResponse.json({ status: 'error', message: 'That verification code is incorrect.' }, { status: 400 });
    }
    if (await employees.findOne({ $or: [{ email }, { id: String(pending.id) }] })) {
      await pendingRegistrations.deleteOne({ _id: pending._id });
      return NextResponse.json({ status: 'error', message: 'That employee ID or email is already registered.' }, { status: 409 });
    }

    const employee = {
      userId: String(pending.userId),
      id: String(pending.id),
      name: String(pending.name),
      position: String(pending.position),
      department: String(pending.department),
      contact: String(pending.contact || ''),
      email,
      passwordHash: String(pending.passwordHash),
      salary_rate: Number(pending.salary_rate) || 25000,
      role: 'employee' as const,
      approved: false,
      profile_pic: undefined,
      createdAt: new Date()
    };
    await employees.insertOne(employee);
    await pendingRegistrations.deleteOne({ _id: pending._id });

    return NextResponse.json({ status: 'pending-approval', email });
  }

  return NextResponse.json({ status: 'error', message: 'Unsupported authentication action.' }, { status: 400 });
}
