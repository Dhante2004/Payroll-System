import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { getMongoClientPromise, mongoDatabaseName } from '@/lib/mongodb';

const sessionCookie = 'mit_session';
const getSessionSecret = () => {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('Missing SESSION_SECRET environment variable.');
  return secret;
};

export interface SessionUser {
  userId: string;
  employeeId: string;
  role: 'admin' | 'employee';
  email: string;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, getSessionSecret()) as unknown as Partial<SessionUser>;
    if (!payload.userId || !payload.employeeId || !payload.email || !payload.role) return null;
    return payload as SessionUser;
  } catch {
    return null;
  }
}

export function createSessionToken(user: SessionUser) {
  return jwt.sign(user, getSessionSecret(), { expiresIn: '1d' });
}

export function setSessionCookie(response: Response, user: SessionUser) {
  response.headers.append('Set-Cookie', `${sessionCookie}=${createSessionToken(user)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
}

export function clearSessionCookie(response: Response) {
  response.headers.append('Set-Cookie', `${sessionCookie}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
}

export async function getDatabase() {
  const client = await getMongoClientPromise();
  return client.db(mongoDatabaseName);
}

export function toEmployee(document: Record<string, unknown>) {
  const { passwordHash: _, _id, ...employee } = document;
  return { ...employee, mongoId: _id instanceof ObjectId ? _id.toString() : undefined };
}

export { ObjectId };
