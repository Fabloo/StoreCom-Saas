'use client';

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { X, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadImage, deleteImage, generatePreviewURL, revokePreviewURL } from '@/lib/firebase-storage';
import type { UploadResult } from '@/lib/firebase-storage';

interface ImageUploadProps {
  onImagesUploaded: (images: UploadResult[]) => void;
  onImagesRemoved?: (imagePaths: string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  folder?: string;
  existingImages?: string[];
  className?: string;
}

export function ImageUpload({
  onImagesUploaded,
  onImagesRemoved,
  multiple = true,
  maxFiles = 10,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  maxSize = 5, // 5MB
  folder = 'images',
  existingImages = [],
  className = ''
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadResult[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Handle file selection
  const handleFiles = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    
    // Validate file types
    const invalidFiles = fileArray.filter(file => !acceptedTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid file type",
        description: `Please select only ${acceptedTypes.join(', ')} files.`,
        variant: "destructive",
      });
      return;
    }

    // Validate file sizes
    const oversizedFiles = fileArray.filter(file => file.size > maxSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: "File too large",
        description: `Files must be smaller than ${maxSize}MB.`,
        variant: "destructive",
      });
      return;
    }

    // Check max files limit
    if (uploadedImages.length + fileArray.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed.`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      // Generate previews
      const previews = fileArray.map(file => generatePreviewURL(file));
      setPreviewImages(prev => [...prev, ...previews]);

      // Upload to Firebase
      const results = await uploadImage(fileArray[0], folder);
      setUploadedImages(prev => [...prev, results]);
      
      // Call the callback
      onImagesUploaded([results]);
      
      toast({
        title: "Success",
        description: "Image uploaded successfully!",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }, [acceptedTypes, maxSize, maxFiles, uploadedImages.length, folder, onImagesUploaded, toast]);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  // Remove image
  const removeImage = async (index: number) => {
    const image = uploadedImages[index];
    if (image) {
      try {
        // Delete from Firebase
        await deleteImage(image.path);
        
        // Remove from local state
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
        setPreviewImages(prev => prev.filter((_, i) => i !== index));
        
        // Call the callback
        if (onImagesRemoved) {
          onImagesRemoved([image.path]);
        }
        
        toast({
          title: "Success",
          description: "Image removed successfully!",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to remove image",
          variant: "destructive",
        });
      }
    }
  };

  // Cleanup previews on unmount
  const cleanupPreviews = useCallback(() => {
    previewImages.forEach(url => revokePreviewURL(url));
  }, [previewImages]);

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={acceptedTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="space-y-2">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="text-sm text-gray-600">
            <p className="font-medium">
              {dragActive ? 'Drop files here' : 'Drag and drop images here'}
            </p>
            <p className="text-xs mt-1">
              or{' '}
              <button
                type="button"
                onClick={triggerFileInput}
                className="text-blue-600 hover:text-blue-500 underline"
              >
                browse files
              </button>
            </p>
          </div>
          <p className="text-xs text-gray-500">
            {acceptedTypes.join(', ')} up to {maxSize}MB each
          </p>
        </div>
      </div>

      {/* Upload Button */}
      <Button
        onClick={triggerFileInput}
        disabled={uploading}
        className="w-full"
        variant="outline"
      >
        <Upload className="h-4 w-4 mr-2" />
        {uploading ? 'Uploading...' : 'Select Images'}
      </Button>

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <div className="space-y-3">
          <Label>Uploaded Images ({uploadedImages.length}/{maxFiles})</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((image, index) => (
              <Card key={image.path} className="relative group">
                <CardContent className="p-2">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-24 object-cover rounded-md"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-md flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      onClick={() => removeImage(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="space-y-3">
          <Label>Existing Images</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {existingImages.map((imageUrl, index) => (
              <Card key={index} className="relative group">
                <CardContent className="p-2">
                  <img
                    src={imageUrl}
                    alt={`Existing image ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


