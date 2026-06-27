import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { UploadCloud, AlertCircle, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void;
  folder?: string;
  label?: string;
  aspectRatio?: 'square' | 'video' | 'banner';
  initialPreview?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUploadSuccess,
  folder = 'general',
  label = 'Upload Image',
  aspectRatio = 'square',
  initialPreview = ''
}) => {
  const { uploadImage } = useMarketplace();
  const [preview, setPreview] = useState<string>(initialPreview);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setPreview(initialPreview);
  }, [initialPreview]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB.');
      return;
    }

    setLoading(true);
    setError(null);

    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase Storage
    const publicUrl = await uploadImage(file, folder);
    setLoading(false);

    if (publicUrl) {
      onUploadSuccess(publicUrl);
    } else {
      setError('Failed to upload image. Please try again.');
    }
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'banner':
        return 'aspect-[21/9] w-full';
      case 'video':
        return 'aspect-video w-full';
      case 'square':
      default:
        return 'aspect-square w-28 sm:w-32';
    }
  };

  return (
    <div className="space-y-2">
      <span className="block text-xs font-semibold text-text-secondary">{label}</span>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-4">
        {/* Preview Frame */}
        <div className={`relative bg-bg-secondary border border-border-main rounded-xl overflow-hidden flex items-center justify-center shrink-0 ${getAspectClass()}`}>
          {preview ? (
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center p-4">
              <UploadCloud className="w-6 h-6 text-text-tertiary mx-auto mb-1" />
              <span className="text-[10px] text-text-tertiary block font-semibold">No Image</span>
            </div>
          )}

          {/* Loader Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
              <Loader2 className="w-6 h-6 animate-spin mb-1 text-accent-gold" />
              <span className="text-[10px] font-semibold tracking-wide uppercase">Uploading...</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex-1 flex flex-col justify-center space-y-2 self-stretch sm:self-center">
          <div>
            <label className="inline-flex items-center justify-center px-4 py-2 bg-text-primary text-bg-primary rounded-xl text-xs font-bold hover:bg-text-secondary transition-all cursor-pointer shadow-sm hover:shadow">
              <span>Select File</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={loading}
              />
            </label>
          </div>
          <p className="text-[10px] text-text-tertiary leading-relaxed">
            Supports JPG, PNG, WEBP. Max size 5MB.
          </p>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-1.5 text-[10px] text-red-500 font-semibold mt-1">
              <AlertCircle className="w-3 h-3" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
