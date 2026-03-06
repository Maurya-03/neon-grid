// Supabase Storage Implementation for Media Uploads
import { supabase, isSupabaseConfigured } from './supabase';

export interface UploadResult {
  url: string;
  path: string;
  name: string;
}

const STORAGE_BUCKET = 'chat-media'; // Supabase bucket name

console.log('🔧 Storage initialized:', isSupabaseConfigured() ? 'Supabase Storage' : 'Mock Mode');

export const uploadToFirebaseStorage = async (
  file: File,
  folder: string = 'chat-media',
  onProgress?: (progress: number) => void
): Promise<UploadResult> => {
  if (!file) {
    throw new Error('No file provided');
  }

  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File too large (max 10MB)');
  }

  // Generate unique filename
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 15);
  const fileName = `${timestamp}_${randomStr}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const storagePath = `${folder}/${fileName}`;

  if (!isSupabaseConfigured()) {
    // Mock implementation for testing until Supabase is configured
    console.log('🔄 Using mock storage (Supabase not configured)');
    console.log('💡 Configure VITE_SUPABASE_URL in .env to enable real uploads');

    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 15 + Math.random() * 10;
        if (progress > 100) progress = 100;

        onProgress?.(Math.round(progress));

        if (progress >= 100) {
          clearInterval(interval);

          // Create a blob URL for testing
          const url = URL.createObjectURL(file);
          const mockResult: UploadResult = {
            url,
            path: storagePath,
            name: fileName
          };

          console.log('✅ Mock upload complete:', mockResult);
          resolve(mockResult);
        }
      }, 100);
    });
  }

  // Real Supabase Storage implementation
  console.log('📤 Uploading to Supabase Storage:', fileName);

  try {
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('❌ Supabase upload error:', error);
      
      // Provide helpful error messages
      if (error.message?.includes('signature') || error.message?.includes('JWT')) {
        console.error('🔴 SIGNATURE ERROR: Your Supabase anon key is invalid or incorrect');
        console.error('📖 See FIX_SIGNATURE_ERROR.txt for step-by-step fix instructions');
        console.error('🔗 Get your correct key from: https://supabase.com/dashboard/project/fwzguzhppvzzyybnhjkj/settings/api');
        throw new Error(`Upload failed: Invalid Supabase credentials. Check your VITE_SUPABASE_ANON_KEY in .env file. See FIX_SIGNATURE_ERROR.txt`);
      }
      
      if (error.message?.includes('bucket') || error.message?.includes('not found')) {
        console.error('🪣 BUCKET ERROR: The chat-media bucket does not exist or is not accessible');
        console.error('📖 Create the bucket: https://supabase.com/dashboard/project/fwzguzhppvzzyybnhjkj/storage/buckets');
        throw new Error(`Upload failed: Storage bucket 'chat-media' not found. See QUICKSTART_SUPABASE.md`);
      }
      
      throw new Error(`Upload failed: ${error.message}`);
    }

    if (!data) {
      throw new Error('Upload failed: No data returned');
    }

    console.log('✅ File uploaded to Supabase:', data.path);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;

    console.log('✅ Public URL generated:', publicUrl);

    // Simulate progress completion
    onProgress?.(100);

    return {
      url: publicUrl,
      path: storagePath,
      name: fileName
    };
  } catch (error: any) {
    console.error('❌ Upload failed:', error);
    throw new Error(`Failed to upload to Supabase: ${error.message}`);
  }
};

export const deleteFromFirebaseStorage = async (path: string): Promise<void> => {
  if (!isSupabaseConfigured()) {
    console.log('🔄 Mock delete (Supabase not configured):', path);
    return;
  }

  try {
    console.log('🗑️ Deleting from Supabase Storage:', path);
    
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([path]);

    if (error) {
      console.error('❌ Supabase delete error:', error);
      throw new Error(`Delete failed: ${error.message}`);
    }

    console.log('✅ File deleted from Supabase Storage');
  } catch (error: any) {
    console.error('Failed to delete file:', error);
    throw error;
  }
};

export const testFirebaseStorageConfig = async (): Promise<boolean> => {
  try {
    console.log('🧪 Testing Supabase Storage configuration...');

    if (!isSupabaseConfigured()) {
      console.log('⚠️ Supabase not configured - using mock storage');
      return true; // Mock storage always works
    }

    // Create a small test file
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d')!;
    ctx.fillRect(0, 0, 1, 1);

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/png');
    });

    const testFile = new File([blob], 'test.png', { type: 'image/png' });

    const result = await uploadToFirebaseStorage(testFile, 'test');
    console.log('✅ Supabase Storage test successful');
    console.log('   URL:', result.url);

    // Clean up test file
    await deleteFromFirebaseStorage(result.path);
    console.log('✅ Test file cleaned up');

    return true;
  } catch (error) {
    console.error('❌ Supabase Storage test failed:', error);
    return false;
  }
};

// Make test function available globally for debugging
(window as any).testFirebaseStorage = testFirebaseStorageConfig;
(window as any).testSupabaseStorage = testFirebaseStorageConfig;