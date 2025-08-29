import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const googleVars = {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'MISSING',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'MISSING',
      GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || 'MISSING',
      GOOGLE_PROJECT_ID: process.env.GOOGLE_PROJECT_ID ? 'SET' : 'MISSING',
      GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL ? 'SET' : 'MISSING',
      GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY ? 'SET' : 'MISSING',
    };

    const otherVars = {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'MISSING',
      DB_NAME: process.env.DB_NAME || process.env.MONGODB_DB_NAME,
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'MISSING',
    };

    const allEnvKeys = Object.keys(process.env).filter(key => 
      key.includes('GOOGLE') || 
      key.includes('MONGODB') || 
      key.includes('JWT') || 
      key.includes('NEXT_PUBLIC')
    );

    return NextResponse.json({
      success: true,
      message: 'Environment variables debug info',
      google: googleVars,
      other: otherVars,
      allRelevantKeys: allEnvKeys,
      timestamp: new Date().toISOString(),
      note: 'Check if .env.local file exists and contains the required variables'
    });
  } catch (error) {
    console.error('[Debug Env] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get environment info' },
      { status: 500 }
    );
  }
} 