import { NextRequest, NextResponse } from 'next/server';
import { userOperations } from '@/lib/database';

// Creates sample users for testing
// super_admin: admin@example.com / Admin@123
// brand_admin: brandadmin@example.com / Brand@123 (no brands assigned by default)
export async function POST(request: NextRequest) {
  try {
    const created: any[] = [];
    async function ensure(email: string, password: string, role: 'super_admin' | 'brand_admin') {
      try {
        const user = await userOperations.createUser({ email, password, role });
        created.push({ email, role, id: user._id?.toString() });
      } catch (e: any) {
        created.push({ email, role, error: 'exists' });
      }
    }
    await ensure('admin@example.com', 'Admin@123', 'super_admin');
    await ensure('brandadmin@example.com', 'Brand@123', 'brand_admin');
    // force set passwords in case users already existed without a password in scrypt format
    await userOperations.setPassword('admin@example.com', 'Admin@123');
    await userOperations.setPassword('brandadmin@example.com', 'Brand@123');

    return NextResponse.json({ success: true, created });
  } catch (error) {
    console.error('Seed error', error);
    return NextResponse.json({ success: false, error: 'Seed failed' }, { status: 500 });
  }
}




