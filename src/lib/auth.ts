import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export type JwtPayload = {
  userId: string;
  role: 'super_admin' | 'brand_admin';
  brandIds?: string[];
};

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export function signJwt(payload: JwtPayload, expiresIn: string = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyJwt<T = JwtPayload>(token: string): T | null {
  try {
    return jwt.verify(token, JWT_SECRET) as T;
  } catch {
    return null;
  }
}

export function getAuthFromRequest(req: NextRequest): JwtPayload | null {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;
  const payload = verifyJwt<JwtPayload>(token);
  return payload;
}

export function assertRole(
  req: NextRequest,
  allowed: Array<'super_admin' | 'brand_admin'>,
  brandId?: string
) {
  const auth = getAuthFromRequest(req);
  if (!auth) {
    const err: any = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }
  if (!allowed.includes(auth.role)) {
    const err: any = new Error('Forbidden');
    err.status = 403;
    throw err;
  }
  if (auth.role === 'brand_admin' && brandId) {
    if (!auth.brandIds?.includes(brandId)) {
      const err: any = new Error('Forbidden: brand access denied');
      err.status = 403;
      throw err;
    }
  }
  return auth;
}


