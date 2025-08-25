# Authentication Setup Guide

This document explains how to set up the authentication system for the Storecom application.

## Overview

The application now has a unified authentication system that uses Google OAuth for both:
1. Google Business API access
2. Application authentication (JWT tokens)

## Prerequisites

1. **Google Cloud Project** with Google Business Profile API enabled
2. **OAuth 2.0 Client ID** configured in Google Cloud Console
3. **MongoDB** database running
4. **Node.js** environment

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/storecom

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:9002/api/google-business/auth

# Base URL for the application
NEXT_PUBLIC_BASE_URL=http://localhost:9002

# Google Business API Configuration (Optional - for service account)
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"your-project","private_key_id":"key-id","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"your-service-account@your-project.iam.gserviceaccount.com","client_id":"client-id","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project.iam.gserviceaccount.com"}
```

## Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Google Business Profile API
   - Google My Business API
   - Google+ API (for user profile information)
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure the OAuth consent screen
6. Set the authorized redirect URIs:
   - `http://localhost:9002/api/google-business/auth` (for development)
   - `http://localhost:9002/api/auth/google/callback` (for login flow)

## How It Works

### 1. User Login Flow
1. User visits `/login` page
2. Clicks "Sign in with Google"
3. Redirected to Google OAuth consent screen
4. After consent, redirected to `/api/auth/google/callback`
5. Callback creates JWT token and sets cookies
6. User redirected to admin dashboard

### 2. API Authentication
1. JWT token stored in localStorage and cookies
2. `authFetch` function automatically adds token to requests
3. API endpoints verify JWT token using `assertRole()`
4. Token contains user role and permissions

### 3. Google Business Integration
1. OAuth tokens stored in HTTP-only cookies
2. Google Business API calls use these tokens
3. Separate from application authentication

## Security Features

- **JWT tokens** with configurable expiration
- **HTTP-only cookies** for sensitive tokens
- **Role-based access control** (super_admin, brand_admin)
- **Secure token storage** in localStorage and cookies
- **Automatic token refresh** for Google OAuth

## Troubleshooting

### "Unauthorized" Error
- Check if user is logged in
- Verify JWT token exists in localStorage
- Check token expiration
- Ensure proper role permissions

### Google OAuth Issues
- Verify redirect URIs in Google Cloud Console
- Check environment variables
- Ensure Google Business Profile API is enabled

### Database Connection
- Verify MongoDB is running
- Check MONGODB_URI format
- Ensure database exists

## Development vs Production

### Development
- Uses `localhost:9002` as base URL
- JWT_SECRET can be any string
- Google OAuth redirects to localhost

### Production
- Set `NEXT_PUBLIC_BASE_URL` to your domain
- Use strong, unique JWT_SECRET
- Update Google OAuth redirect URIs
- Enable HTTPS for all endpoints

## API Endpoints

- `POST /api/auth/login` - Traditional login (not used in current flow)
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/google-business/auth` - Google Business OAuth
- `POST /api/brands` - Create brand (requires authentication)
- `GET /api/brands` - List brands (requires authentication)

## User Roles

- **super_admin**: Full access to all brands and stores
- **brand_admin**: Access only to assigned brands

## Next Steps

1. Set up environment variables
2. Configure Google Cloud Console
3. Start the application
4. Visit `/login` to test authentication
5. Create your first brand after logging in


