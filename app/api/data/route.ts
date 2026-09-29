import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDatabase, getSessionUser, ObjectId, toEmployee } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

export const runtime = 'nodejs';

async function requireSession() {
  const session = await getSessionUser();
  if (!session) return null;
  return session;
}

export async function GET() {
  const session = await requireSession();
  if (!session) return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });

  const database = await getDatabase();
  const employeesCollection = database.collection('employees');
  const payrollCollection = database.collection('payrollRecords');
  const employeeFilter = session.role === 'admin' ? {} : { userId: session.userId };
  const payrollFilter = session.role === 'admin'
    ? {}
    : { $or: [{ employeeUid: session.userId }, { employee_id: session.employeeId }] };
  const [employees, payrollRecords] = await Promise.all([
    employeesCollection.find(employeeFilter).sort({ name: 1 }).toArray(),
    payrollCollection.find(payrollFilter).sort({ payroll_date: -1 }).toArray()
  ]);

  return NextResponse.json({
    employees: employees.map(toEmployee),
    payrollRecords: payrollRecords.map(record => ({ ...record, _id: record._id.toString() }))
  });
}

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ message: 'Administrator access required.' }, { status: 403 });

  const body = await request.json();
  const database = await getDatabase();
  if (body.action === 'employee') {
    const password = String(body.employee?.password || '');
    if (password.length < 6) {
      return NextResponse.json({ message: 'An initial password of at least 6 characters is required.' }, { status: 400 });
    }
    const employee = { ...body.employee, passwordHash: await bcrypt.hash(password, 12), createdAt: new Date() };
    delete employee.password;
    if (!String(employee.id || '').trim()) {
      return NextResponse.json({ message: 'The school employee ID is required.' }, { status: 400 });
    }
    if (await database.collection('employees').findOne({ id: employee.id })) {
      return NextResponse.json({ message: 'That school employee ID is already in use.' }, { status: 409 });
    }
    delete employee.mongoId;
    const result = await database.collection('employees').insertOne(employee);
    return NextResponse.json({ employee: toEmployee({ ...employee, _id: result.insertedId }) }, { status: 201 });
  }

  if (body.action === 'payroll') {
    const result = await database.collection('payrollRecords').insertOne({ ...body.record, createdAt: new Date() });
    return NextResponse.json({ record: { ...body.record, _id: result.insertedId.toString() } }, { status: 201 });
  }

  return NextResponse.json({ message: 'Unsupported data action.' }, { status: 400 });
}

export async function PATCH(request: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });

  const body = await request.json();
  if (body.action === 'profile') {
    const profile = body.profile || {};
    const name = String(profile.name || '').trim();
    const position = String(profile.position || '').trim();
    const department = String(profile.department || '').trim();
    const profilePic = String(profile.profile_pic || '');
    if (!name || !position || !department) {
      return NextResponse.json({ message: 'Name, position, and department are required.' }, { status: 400 });
    }
    if (profilePic && (!profilePic.startsWith('data:image/') || profilePic.length > 2_000_000)) {
      return NextResponse.json({ message: 'Profile pictures must be compressed image files under 1.5 MB.' }, { status: 400 });
    }
    const updates: Record<string, string> = { name, position, department };
    if (profilePic) updates.profile_pic = profilePic;
    const database = await getDatabase();
    await database.collection('employees').updateOne({ userId: session.userId }, { $set: updates });
    const employee = await database.collection('employees').findOne({ userId: session.userId });
    return NextResponse.json({ employee: employee ? toEmployee(employee) : null });
  }

  if (session.role !== 'admin') return NextResponse.json({ message: 'Administrator access required.' }, { status: 403 });

  if (body.action === 'payroll') {
    const mongoId = String(body.mongoId || '');
    if (!ObjectId.isValid(mongoId)) return NextResponse.json({ message: 'Invalid payroll record ID.' }, { status: 400 });
    const input = body.record || {};
    const amountFields = ['basic_salary', 'allowance', 'absences', 'cash_advances', 'sss', 'phic', 'pagibig', 'wtax', 'loan_sss', 'loan_pagibig', 'other_deductions'] as const;
    const amounts = Object.fromEntries(amountFields.map(field => [field, Number(input[field] || 0)])) as Record<typeof amountFields[number], number>;
    if (Object.values(amounts).some(amount => !Number.isFinite(amount) || amount < 0)) {
      return NextResponse.json({ message: 'Payroll amounts must be valid non-negative numbers.' }, { status: 400 });
    }
    const payrollDate = String(input.payroll_date || '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(payrollDate) || Number.isNaN(new Date(`${payrollDate}T00:00:00`).getTime())) {
      return NextResponse.json({ message: 'A valid payroll date is required.' }, { status: 400 });
    }
    const grossPay = amounts.basic_salary + amounts.allowance;
    const totalDeduction = amounts.absences + amounts.cash_advances + amounts.sss + amounts.phic + amounts.pagibig + amounts.wtax + amounts.loan_sss + amounts.loan_pagibig + amounts.other_deductions;
    const database = await getDatabase();
    const payrollCollection = database.collection('payrollRecords');
    const result = await payrollCollection.updateOne(
      { _id: new ObjectId(mongoId) },
      { $set: { ...amounts, payroll_date: payrollDate, gross_pay: grossPay, total_deduction: totalDeduction, net_pay: grossPay - totalDeduction, updatedAt: new Date() } }
    );
    if (!result.matchedCount) return NextResponse.json({ message: 'Payroll record was not found.' }, { status: 404 });
    const record = await payrollCollection.findOne({ _id: new ObjectId(mongoId) });
    return NextResponse.json({ record: record ? { ...record, _id: String(record._id) } : null });
  }

  const id = String(body.mongoId || '');
  if (!ObjectId.isValid(id)) return NextResponse.json({ message: 'Invalid employee document ID.' }, { status: 400 });
  if (body.action === 'reject-employee') {
    const employees = (await getDatabase()).collection('employees');
    const rejectedEmployee = await employees.findOne({ _id: new ObjectId(id), role: 'employee', approved: false });
    if (!rejectedEmployee) {
      return NextResponse.json({ message: 'Only pending employee registrations can be rejected.' }, { status: 404 });
    }
    const result = await employees.deleteOne({ _id: new ObjectId(id), role: 'employee', approved: false });
    if (!result.deletedCount) {
      return NextResponse.json({ message: 'Only pending employee registrations can be rejected.' }, { status: 404 });
    }
    let notificationSent = false;
    try {
      notificationSent = await sendEmail(
        String(rejectedEmployee.email),
        'MIT payroll account registration update',
        `Hello ${String(rejectedEmployee.name)},\n\nYour employee account registration was not approved. You may contact the school administrator for more information, or register again with corrected details.\n\nMahardika Institute of Technology`
      );
    } catch (error) {
      console.error('Unable to send registration rejection notice:', error);
    }
    return NextResponse.json({ status: 'success', notificationSent });
  }
  if (body.action === 'approve-employee') {
    const employees = (await getDatabase()).collection('employees');
    const approvedEmployee = await employees.findOne({ _id: new ObjectId(id), role: 'employee', approved: false });
    if (!approvedEmployee) {
      return NextResponse.json({ message: 'Only pending employee registrations can be approved.' }, { status: 404 });
    }
    await employees.updateOne(
      { _id: new ObjectId(id), role: 'employee', approved: false },
      { $set: { approved: true, approvedAt: new Date() } }
    );
    let notificationSent = false;
    try {
      notificationSent = await sendEmail(
        String(approvedEmployee.email),
        'Your MIT payroll account is approved',
        `Hello ${String(approvedEmployee.name)},\n\nYour employee account has been approved. You can now sign in using your employee ID or email and password. A verification code will be sent the first time you sign in on each device.\n\nMahardika Institute of Technology`
      );
    } catch (error) {
      console.error('Unable to send account approval notice:', error);
    }
    return NextResponse.json({ status: 'success', notificationSent });
  }
  const employee = { ...body.employee };
  delete employee.mongoId;
  delete employee.passwordHash;
  delete employee._id;
  if (!String(employee.id || '').trim()) {
    return NextResponse.json({ message: 'The school employee ID is required.' }, { status: 400 });
  }
  const existingEmployee = await (await getDatabase()).collection('employees').findOne({ id: employee.id, _id: { $ne: new ObjectId(id) } });
  if (existingEmployee) {
    return NextResponse.json({ message: 'That school employee ID is already in use.' }, { status: 409 });
  }
  await (await getDatabase()).collection('employees').updateOne({ _id: new ObjectId(id) }, { $set: employee });
  return NextResponse.json({ status: 'success' });
}

export async function DELETE(request: NextRequest) {
  const session = await requireSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ message: 'Administrator access required.' }, { status: 403 });

  const body = await request.json();
  const id = String(body.mongoId || '');
  if (!ObjectId.isValid(id)) return NextResponse.json({ message: 'Invalid employee document ID.' }, { status: 400 });
  if (body.action === 'payroll') {
    const result = await (await getDatabase()).collection('payrollRecords').deleteOne({ _id: new ObjectId(id) });
    if (!result.deletedCount) return NextResponse.json({ message: 'Payroll record was not found.' }, { status: 404 });
    return NextResponse.json({ status: 'success' });
  }
  await (await getDatabase()).collection('employees').deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ status: 'success' });
}
