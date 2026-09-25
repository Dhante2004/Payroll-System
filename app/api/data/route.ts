import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, getSessionUser, ObjectId, toEmployee } from '@/lib/auth';

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
    const employee = { ...body.employee, createdAt: new Date() };
    if (!String(employee.id || '').trim()) {
      return NextResponse.json({ message: 'The school employee ID is required.' }, { status: 400 });
    }
    if (await database.collection('employees').findOne({ id: employee.id })) {
      return NextResponse.json({ message: 'That school employee ID is already in use.' }, { status: 409 });
    }
    delete employee.passwordHash;
    delete employee.mongoId;
    const result = await database.collection('employees').insertOne(employee);
    return NextResponse.json({ employee: { ...employee, mongoId: result.insertedId.toString() } }, { status: 201 });
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

  const id = String(body.mongoId || '');
  if (!ObjectId.isValid(id)) return NextResponse.json({ message: 'Invalid employee document ID.' }, { status: 400 });
  if (body.action === 'approve-employee') {
    await (await getDatabase()).collection('employees').updateOne(
      { _id: new ObjectId(id), role: 'employee' },
      { $set: { approved: true, approvedAt: new Date() } }
    );
    return NextResponse.json({ status: 'success' });
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
  await (await getDatabase()).collection('employees').deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ status: 'success' });
}
