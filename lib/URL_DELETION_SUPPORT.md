# Supabase Storage - URL-Based Deletion Support

## What Changed

I've updated the Supabase storage service to support **deleting files using URLs** instead of requiring file paths. This is perfect since you're only storing URLs in your database!

## Key Updates

### 1. New Helper Function: `extractPathFromUrl()`

Extracts the file path from a Supabase storage URL:

```typescript
const url = "https://project.supabase.co/storage/v1/object/public/uploads/avatars/123-abc-photo.jpg";
const path = extractPathFromUrl(url); 
// Returns: "avatars/123-abc-photo.jpg"
```

### 2. Updated `deleteFile()` Function

Now accepts **both URLs and paths**:

```typescript
// ✅ Works with URL (from database)
await deleteFile("https://project.supabase.co/storage/v1/object/public/uploads/avatars/photo.jpg");

// ✅ Still works with path
await deleteFile("avatars/photo.jpg");
```

The function automatically detects if you're passing a URL (starts with `http`) and extracts the path.

### 3. Updated `deleteMultipleFiles()` Function

Also accepts **both URLs and paths**:

```typescript
const mediaUrls = [
  "https://project.supabase.co/.../uploads/posts/image1.jpg",
  "https://project.supabase.co/.../uploads/posts/image2.jpg"
];

// ✅ Works directly with URLs
await deleteMultipleFiles(mediaUrls);
```

## Usage Example

### Before (Required Path)
```typescript
// ❌ Problem: You only have URL, not path
const imageUrl = "https://..."; // from database
const imagePath = "???";        // Don't have this!
await deleteFile(imagePath);     // Can't delete!
```

### After (URL Support)
```typescript
// ✅ Solution: Just use the URL!
const imageUrl = "https://..."; // from database
await deleteFile(imageUrl);      // Works!
```

## Complete Example: Update Profile Picture

```typescript
import { uploadFile, deleteFile } from '@/lib/supabase-s3.service';

async function updateAvatar(newFile: File, currentAvatarUrl?: string) {
  // 1. Delete old avatar (using URL from database)
  if (currentAvatarUrl) {
    await deleteFile(currentAvatarUrl);
  }
  
  // 2. Upload new avatar
  const result = await uploadFile(newFile, 'avatars');
  
  // 3. Save only the URL to database
  await prisma.user.update({
    where: { id: userId },
    data: { image: result.url } // Only save URL!
  });
  
  return result.url;
}
```

## Benefits

1. ✅ **Simpler Database Schema** - Only store URLs, not paths
2. ✅ **Less Data** - URLs are already needed for display
3. ✅ **Easier Deletion** - Use the same URL you already have
4. ✅ **Backward Compatible** - Still works with paths if needed

## Files Updated

- `lib/supabase-s3.service.ts` - Added URL support
- `lib/supabase-storage-examples.ts` - Updated examples to use URLs
