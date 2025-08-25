import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  listAll,
  StorageReference
} from 'firebase/storage';
import { storage } from './firebase';

export interface UploadResult {
  url: string;
  path: string;
  name: string;
}

export interface ImageFile {
  file: File;
  preview?: string;
  name: string;
  size: number;
  type: string;
}

/**
 * Upload a single image to Firebase Storage
 */
export async function uploadImage(
  file: File, 
  folder: string = 'images',
  customName?: string
): Promise<UploadResult> {
  try {
    const fileName = customName || `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `${folder}/${fileName}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      url: downloadURL,
      path: snapshot.ref.fullPath,
      name: fileName
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Upload multiple images to Firebase Storage
 */
export async function uploadMultipleImages(
  files: File[], 
  folder: string = 'images'
): Promise<UploadResult[]> {
  try {
    const uploadPromises = files.map(file => uploadImage(file, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw new Error('Failed to upload images');
  }
}

/**
 * Delete an image from Firebase Storage
 */
export async function deleteImage(imagePath: string): Promise<void> {
  try {
    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image');
  }
}

/**
 * Get download URL for an image
 */
export async function getImageURL(imagePath: string): Promise<string> {
  try {
    const imageRef = ref(storage, imagePath);
    return await getDownloadURL(imageRef);
  } catch (error) {
    console.error('Error getting image URL:', error);
    throw new Error('Failed to get image URL');
  }
}

/**
 * List all images in a folder
 */
export async function listImages(folder: string = 'images'): Promise<string[]> {
  try {
    const folderRef = ref(storage, folder);
    const result = await listAll(folderRef);
    
    const urls = await Promise.all(
      result.items.map(itemRef => getDownloadURL(itemRef))
    );
    
    return urls;
  } catch (error) {
    console.error('Error listing images:', error);
    throw new Error('Failed to list images');
  }
}

/**
 * Generate a preview URL for an image file
 */
export function generatePreviewURL(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Clean up preview URL to prevent memory leaks
 */
export function revokePreviewURL(url: string): void {
  URL.revokeObjectURL(url);
}


