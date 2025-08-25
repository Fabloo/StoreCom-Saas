import { NextRequest, NextResponse } from 'next/server';
import { googleBusinessServiceAccountAPI } from '@/lib/google-business-service-account';
import { googleBusinessAPI } from '@/lib/google-business-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locationName = searchParams.get('locationName');

    if (!locationName) {
      return NextResponse.json(
        { error: 'Location name is required' }, 
        { status: 400 }
      );
    }

    // Prefer OAuth
    const refreshToken = request.cookies.get('gbp_refresh_token')?.value;
    const accessToken = request.cookies.get('gbp_access_token')?.value;
    if (refreshToken || accessToken) {
      try {
        googleBusinessAPI.setAuthMode('oauth');
        if (refreshToken) {
          googleBusinessAPI.setRefreshToken(refreshToken);
        } else if (accessToken) {
          googleBusinessAPI.setCredentials({ access_token: accessToken } as any);
        }
        const posts = await googleBusinessAPI.getPosts(locationName);
        return NextResponse.json({ success: true, posts });
      } catch (oauthErr) {
        // fall through
      }
    }

    const posts = await googleBusinessServiceAccountAPI.getPosts(locationName);
    return NextResponse.json({ success: true, posts });

  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locationName = searchParams.get('locationName');

    if (!locationName) {
      return NextResponse.json(
        { error: 'Location name is required' }, 
        { status: 400 }
      );
    }

    const postData = await request.json();

    // Prefer OAuth
    const refreshToken = request.cookies.get('gbp_refresh_token')?.value;
    const accessToken = request.cookies.get('gbp_access_token')?.value;
    if (refreshToken || accessToken) {
      try {
        googleBusinessAPI.setAuthMode('oauth');
        if (refreshToken) {
          googleBusinessAPI.setRefreshToken(refreshToken);
        } else if (accessToken) {
          googleBusinessAPI.setCredentials({ access_token: accessToken } as any);
        }
        const newPost = await googleBusinessAPI.createPost(locationName, postData);
        return NextResponse.json({ success: true, post: newPost });
      } catch (oauthErr) {
        // fall through
      }
    }

    const newPost = await googleBusinessServiceAccountAPI.createPost(locationName, postData);
    return NextResponse.json({ success: true, post: newPost });

  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postName = searchParams.get('postName');

    if (!postName) {
      return NextResponse.json(
        { error: 'Post name is required' }, 
        { status: 400 }
      );
    }

    // Prefer OAuth
    const refreshToken = request.cookies.get('gbp_refresh_token')?.value;
    const accessToken = request.cookies.get('gbp_access_token')?.value;
    if (refreshToken || accessToken) {
      try {
        googleBusinessAPI.setAuthMode('oauth');
        if (refreshToken) {
          googleBusinessAPI.setRefreshToken(refreshToken);
        } else if (accessToken) {
          googleBusinessAPI.setCredentials({ access_token: accessToken } as any);
        }
        await googleBusinessAPI.deletePost(postName);
        return NextResponse.json({ success: true, message: 'Post deleted successfully' });
      } catch (oauthErr) {
        // fall through
      }
    }

    await googleBusinessServiceAccountAPI.deletePost(postName);
    return NextResponse.json({ success: true, message: 'Post deleted successfully' });

  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' }, 
      { status: 500 }
    );
  }
} 