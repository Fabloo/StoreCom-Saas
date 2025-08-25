import { NextRequest, NextResponse } from 'next/server';
import { scryptSync, timingSafeEqual } from 'node:crypto';
import { signJwt } from '@/lib/auth';
import { userOperations } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 });
    }

    const user = await userOperations.findByEmail(email);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify scrypt hash formatted as scrypt$salt$derived
    let ok = false;
    if (user.passwordHash && user.passwordHash.startsWith('scrypt$')) {
      const [, salt, stored] = user.passwordHash.split('$');
      const derived = scryptSync(password, salt, 64).toString('hex');
      ok = timingSafeEqual(Buffer.from(stored, 'hex'), Buffer.from(derived, 'hex'));
    }
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signJwt({ userId: user._id!.toString(), role: user.role, brandIds: user.brandIds });
    return NextResponse.json({ success: true, token, role: user.role, brandIds: user.brandIds });
  } catch (error) {
    console.error('Login error', error);
    return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 });
  }
}




