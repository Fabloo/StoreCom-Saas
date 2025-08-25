# Firebase Storage Setup Guide

This guide will help you set up Firebase Storage for image uploads in your Storecom application.

## Prerequisites

1. **Firebase Account** - Sign up at [Firebase Console](https://console.firebase.google.com/)
2. **Node.js** - Version 16 or higher
3. **Firebase CLI** (optional) - For advanced configuration

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "storecom-app")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Firebase Storage

1. In your Firebase project, click on "Storage" in the left sidebar
2. Click "Get started"
3. Choose a location for your storage bucket (select the closest to your users)
4. Choose security rules:
   - **Start in test mode** (for development)
   - **Start in locked mode** (for production)
5. Click "Done"

## Step 3: Configure Security Rules

For development, you can use these basic rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true; // WARNING: Only for development!
    }
  }
}
```

**⚠️ IMPORTANT**: These rules allow anyone to read/write to your storage. For production, use proper authentication rules.

## Step 4: Get Firebase Configuration

1. In your Firebase project, click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>) to add a web app
5. Enter an app nickname (e.g., "storecom-web")
6. Click "Register app"
7. Copy the configuration object

## Step 5: Set Environment Variables

Create a `.env.local` file in your project root with:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Other configurations...
MONGODB_URI=mongodb://localhost:27017/storecom
JWT_SECRET=your-jwt-secret
```

## Step 6: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Go to the brand creation form
3. Navigate to the "Gallery" tab
4. Try uploading an image

## Features

### Image Upload Component
- **Drag & Drop**: Users can drag images directly onto the upload area
- **File Selection**: Click to browse and select images
- **Multiple Uploads**: Upload multiple images at once
- **File Validation**: Checks file type and size
- **Progress Feedback**: Shows upload status
- **Preview**: Displays uploaded images with thumbnails

### Firebase Storage Functions
- `uploadImage()`: Upload single image
- `uploadMultipleImages()`: Upload multiple images
- `deleteImage()`: Remove image from storage
- `getImageURL()`: Get download URL
- `listImages()`: List all images in a folder

### Security Features
- File type validation (JPEG, PNG, WebP, GIF)
- File size limits (configurable)
- Maximum file count limits
- Secure file naming with timestamps

## Production Considerations

### 1. Security Rules
Update your Firebase Storage rules to require authentication:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true; // Anyone can view images
      allow write: if request.auth != null; // Only authenticated users can upload
    }
  }
}
```

### 2. Image Optimization
- Consider implementing image compression
- Add support for different image sizes (thumbnails, medium, large)
- Implement lazy loading for better performance

### 3. CDN Configuration
- Firebase Storage automatically serves images through Google's CDN
- Consider using Firebase Hosting for additional optimization

### 4. Monitoring
- Set up Firebase Analytics to track usage
- Monitor storage costs and usage patterns
- Set up alerts for unusual activity

## Troubleshooting

### Common Issues

1. **"Firebase not initialized" error**
   - Check your environment variables
   - Ensure `.env.local` is in the project root
   - Restart your development server

2. **Upload fails with "Permission denied"**
   - Check your Firebase Storage security rules
   - Ensure your project is properly configured

3. **Images not displaying**
   - Check browser console for errors
   - Verify image URLs are accessible
   - Check Firebase Storage bucket permissions

4. **Large file uploads fail**
   - Check file size limits in your component
   - Consider implementing chunked uploads for very large files

### Getting Help

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Storage Guide](https://firebase.google.com/docs/storage)
- [Firebase Console](https://console.firebase.google.com/)

## Next Steps

1. **Customize Upload Limits**: Adjust `maxFiles`, `maxSize`, and `acceptedTypes` in the ImageUpload component
2. **Add Image Processing**: Implement image resizing, compression, or format conversion
3. **Implement User Authentication**: Add user-specific image folders and permissions
4. **Add Image Metadata**: Store additional information like tags, categories, or descriptions
5. **Implement Image Search**: Add search functionality for uploaded images


