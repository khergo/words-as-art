import { useState, useRef } from 'react';
import { useEdit } from '@/contexts/EditContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';

interface EditableImageProps {
  src: string;
  alt: string;
  onSave: (url: string) => Promise<void>;
  className?: string;
  bucketName?: string;
  folder?: string;
}

export const EditableImage = ({ 
  src, 
  alt, 
  onSave, 
  className = '',
  bucketName = 'project-photos',
  folder = 'general'
}: EditableImageProps) => {
  const { editMode } = useEdit();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}_${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      await onSave(publicUrl);

      toast({
        title: "Image uploaded!",
        description: "Image updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Could not upload image.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group">
      <img src={src} alt={alt} className={className} />
      
      {editMode && (
        <>
          <div 
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="bg-white rounded-lg p-4 flex flex-col items-center gap-2">
              <Upload className="w-8 h-8" />
              <span className="font-handwritten text-sm">
                {uploading ? 'Uploading...' : 'Change Image'}
              </span>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </>
      )}
    </div>
  );
};
