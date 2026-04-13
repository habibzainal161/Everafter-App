/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { Upload, X, Image as ImageIcon, Video, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface CloudinaryUploadProps {
  onUploadSuccess: (asset: { type: 'image' | 'video'; url: string; publicId: string }) => void;
  label?: string;
  className?: string;
}

export default function CloudinaryUpload({ onUploadSuccess, label, className }: CloudinaryUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cloudName = (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = (import.meta as any).env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const processFiles = async (files: File[]) => {
    if (!files.length) return;
    
    setIsUploading(true);
    setError(null);
    setUploadProgress({ current: 0, total: files.length });

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(prev => ({ ...prev, current: i + 1 }));

      if (!cloudName || !uploadPreset) {
        // Fallback ke Base64 lokal
        await new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            onUploadSuccess({
              type: file.type.startsWith('video/') ? 'video' : 'image',
              url: reader.result as string,
              publicId: `local_${file.name}_${Date.now()}`,
            });
            resolve();
          };
          reader.onerror = () => {
            console.error('Gagal membaca file lokal:', file.name);
            resolve();
          };
          reader.readAsDataURL(file);
        });
        continue;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      const resourceType = file.type.startsWith('video/') ? 'video' : 'image';

      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
          { method: 'POST', body: formData }
        );

        if (!response.ok) throw new Error('Upload failed');

        const data = await response.json();
        onUploadSuccess({
          type: resourceType,
          url: data.secure_url,
          publicId: data.public_id,
        });
      } catch (err) {
        console.error('Upload error:', err);
        setError(`Gagal mengunggah beberapa file. Pastikan konfigurasi Cloudinary benar.`);
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div 
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group",
          isDragOver ? "border-blue-500 bg-blue-500/10 scale-[1.02]" : "border-dark-border hover:border-blue-500 hover:bg-blue-500/5",
          label ? "p-4" : "p-8"
        )}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*,video/*"
          multiple
        />
        {isUploading ? (
          <Loader2 size={label ? 20 : 32} className="text-blue-500 animate-spin" />
        ) : (
          <Upload size={label ? 20 : 32} className={cn("transition-colors", isDragOver ? "text-blue-500" : "text-dark-muted group-hover:text-blue-500")} />
        )}
        <div className="text-center pointer-events-none">
          <p className={cn("font-medium text-dark-text", label ? "text-[10px]" : "text-sm")}>
            {isUploading 
              ? `Mengunggah ${uploadProgress.current} dari ${uploadProgress.total}...` 
              : (label || 'Klik atau Drag & Drop banyak foto sekaligus')}
          </p>
          {!label && <p className="text-xs text-dark-muted mt-1">Mendukung format gambar dan video prewedding</p>}
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
