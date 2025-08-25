import { NextRequest, NextResponse } from 'next/server';
import { googleBusinessServiceAccountAPI } from '@/lib/google-business-service-account';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountIdParam = searchParams.get('accountId');
    let accountName = searchParams.get('accountName');

    if (!accountName && accountIdParam) {
      accountName = accountIdParam.startsWith('accounts/') ? accountIdParam : `accounts/${accountIdParam}`;
    }

    if (!accountName) {
      return NextResponse.json(
        { error: 'Account name is required' },
        { status: 400 }
      );
    }

    const notifications = await googleBusinessServiceAccountAPI.getNotifications(accountName);

    return NextResponse.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}


