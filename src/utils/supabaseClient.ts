import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const uploadImage = async (file: File, folder: string = 'general'): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('clothza-media')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) {
      console.error('Error uploading file to Supabase storage:', error);
      return null;
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('clothza-media')
      .getPublicUrl(fileName);
      
    return publicUrl;
  } catch (err) {
    console.error('Exception during image upload:', err);
    return null;
  }
};
