# File Management API Endpoints

## Single File Operations

### Upload a File
**Endpoint:** `POST /api/files`

**Content-Type:** `multipart/form-data`

**Request:**
```javascript
const formData = new FormData();
formData.append('file', fileObject); // File object from input

const response = await fetch('/api/files', {
  method: 'POST',
  body: formData
});

const result = await response.json();
// {
//   success: true,
//   url: "https://...",
//   type: "image",
//   path: "uploads/..."
// }
```

---

### Delete a Single File
**Endpoint:** `DELETE /api/files`

**Content-Type:** `multipart/form-data`

**Request:**
```javascript
const formData = new FormData();
formData.append('link', fileUrl); // URL or path to the file

const response = await fetch('/api/files', {
  method: 'DELETE',
  body: formData
});

const result = await response.json();
// {
//   success: true,
//   result: true
// }
```

---

## Batch Operations

### Delete Multiple Files
**Endpoint:** `DELETE /api/files/batch`

**Content-Type:** `application/json`

**Request:**
```javascript
const response = await fetch('/api/files/batch', {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    links: [
      'https://your-supabase-url.com/storage/v1/object/public/uploads/file1.jpg',
      'https://your-supabase-url.com/storage/v1/object/public/uploads/file2.jpg',
      'uploads/file3.jpg', // Can also use paths directly
    ]
  })
});

const result = await response.json();
// {
//   success: true,
//   deletedCount: 3,
//   result: true
// }
```

---

## Usage Examples

### Example 1: Upload and Delete Single File
```javascript
// Upload
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

const formData = new FormData();
formData.append('file', file);

const uploadResponse = await fetch('/api/files', {
  method: 'POST',
  body: formData
});

const { url } = await uploadResponse.json();

// Later... Delete
const deleteFormData = new FormData();
deleteFormData.append('link', url);

await fetch('/api/files', {
  method: 'DELETE',
  body: deleteFormData
});
```

### Example 2: Delete Multiple Files at Once
```javascript
const filesToDelete = [
  'https://example.com/file1.jpg',
  'https://example.com/file2.png',
  'https://example.com/file3.pdf',
];

const response = await fetch('/api/files/batch', {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ links: filesToDelete })
});

if (response.ok) {
  console.log('All files deleted successfully');
}
```

### Example 3: Clean up old post media
```javascript
async function deletePostMedia(mediaUrls) {
  try {
    const response = await fetch('/api/files/batch', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ links: mediaUrls })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`Successfully deleted ${result.deletedCount} files`);
    }
  } catch (error) {
    console.error('Failed to delete files:', error);
  }
}

// Usage
const postMedia = ['url1', 'url2', 'url3'];
await deletePostMedia(postMedia);
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `400` - Bad request (missing or invalid parameters)
- `500` - Server error

Error response format:
```json
{
  "error": "Error message",
  "message": "Detailed error information"
}
```
