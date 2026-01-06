# Supabase Storage Service

Utility functions for uploading and deleting files using Supabase Storage.

## Features

- ✅ Upload files with automatic retry (3 attempts by default)
- ✅ Exponential backoff for retries (1s, 2s, 4s)
- ✅ Automatic file type detection (image, video, audio, pdf, file)
- ✅ Unique file path generation
- ✅ Delete single or multiple files
- ✅ Get public URLs for uploaded files

## Setup

### 1. Add Environment Variables

Add these to your `.env` file:

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
NEXT_PUBLIC_SUPABASE_BUCKET="uploads"
```

### 2. Create Supabase Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to **Storage** → **Create bucket**
3. Create a bucket named `uploads` (or your preferred name)
4. Set the bucket to **Public** if you want files to be accessible via URL

## Usage Examples

### Upload a File

```typescript
import { uploadFile } from '@/lib/supabase-s3.service';

// Client-side upload (e.g., in a component)
async function handleFileUpload(file: File) {
  try {
    const result = await uploadFile(file, 'avatars');
    
    console.log('Upload successful!');
    console.log('URL:', result.url);        // Public URL
    console.log('Type:', result.type);      // 'image', 'video', 'audio', etc.
    console.log('Path:', result.path);      // Storage path for deletion
    
    // Save URL to database
    await saveToDatabase({
      imageUrl: result.url,
      imagePath: result.path,
    });
  } catch (error) {
    console.error('Upload failed:', error);
  }
}
```

### Upload with Custom Retry Count

```typescript
// Upload with 5 retry attempts instead of default 3
const result = await uploadFile(file, 'posts', 5);
```

### Delete a File

```typescript
import { deleteFile } from '@/lib/supabase-s3.service';

async function handleFileDelete(filePath: string) {
  try {
    await deleteFile(filePath);
    console.log('File deleted successfully!');
  } catch (error) {
    console.error('Delete failed:', error);
  }
}
```

### Delete Multiple Files

```typescript
import { deleteMultipleFiles } from '@/lib/supabase-s3.service';

const filePaths = [
  'avatars/1234567890-abc-profile.jpg',
  'posts/1234567891-def-photo.png',
];

await deleteMultipleFiles(filePaths);
```

### Get Public URL

```typescript
import { getPublicUrl } from '@/lib/supabase-s3.service';

const url = getPublicUrl('avatars/1234567890-abc-profile.jpg');
console.log(url); // https://your-project.supabase.co/storage/v1/object/public/uploads/...
```

## Practical Examples

### Profile Picture Upload Component

```tsx
'use client';

import { useState } from 'react';
import { uploadFile, deleteFile } from '@/lib/supabase-s3.service';

export function ProfilePictureUpload() {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imagePath, setImagePath] = useState<string>('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const result = await uploadFile(file, 'avatars');
      
      setImageUrl(result.url);
      setImagePath(result.path);
      
      // Save to your backend
      await fetch('/api/user/update-avatar', {
        method: 'POST',
        body: JSON.stringify({ avatarUrl: result.url }),
      });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!imagePath) return;

    try {
      await deleteFile(imagePath);
      setImageUrl('');
      setImagePath('');
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
      />
      {imageUrl && (
        <>
          <img src={imageUrl} alt="Profile" />
          <button onClick={handleDelete}>Delete</button>
        </>
      )}
    </div>
  );
}
```

### Post with Multiple Images

```typescript
async function uploadPostImages(files: File[]) {
  const uploadPromises = files.map(file => 
    uploadFile(file, 'posts')
  );
  
  const results = await Promise.all(uploadPromises);
  
  return results.map(r => ({
    url: r.url,
    type: r.type,
    path: r.path,
  }));
}
```

## File Organization

The service automatically organizes files using the `folder` parameter:

- **Avatars**: `uploadFile(file, 'avatars')`
- **Posts**: `uploadFile(file, 'posts')`
- **Messages**: `uploadFile(file, 'messages')`
- **Stories**: `uploadFile(file, 'stories')`

Each file gets a unique name with timestamp and random string to prevent conflicts.

## Error Handling

The upload function includes automatic retry logic:

- **Attempt 1**: Immediate
- **Attempt 2**: After 1 second
- **Attempt 3**: After 2 seconds (total 3 attempts)

If all attempts fail, an error is thrown with details.

## API Reference

### `uploadFile(file, folder?, maxRetries?)`

Uploads a file to Supabase Storage with retry logic.

**Parameters:**
- `file` (File): File to upload
- `folder` (string, optional): Folder path in storage
- `maxRetries` (number, optional): Maximum retry attempts (default: 3)

**Returns:** `Promise<UploadResult>`
```typescript
{
  url: string;      // Public URL
  type: string;     // 'image' | 'video' | 'audio' | 'pdf' | 'file'
  path: string;     // Storage path (use for deletion)
}
```

### `deleteFile(filePath)`

Deletes a single file from storage.

**Parameters:**
- `filePath` (string): Path returned from `uploadFile`

**Returns:** `Promise<boolean>`

### `deleteMultipleFiles(filePaths)`

Deletes multiple files from storage.

**Parameters:**
- `filePaths` (string[]): Array of file paths

**Returns:** `Promise<boolean>`

### `getPublicUrl(filePath)`

Gets the public URL for a file.

**Parameters:**
- `filePath` (string): Path to file in storage

**Returns:** `string`
