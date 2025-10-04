import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
}

export function ImageUpload({ images, onImagesChange, maxImages = 8 }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newImages = [...images, ...files].slice(0, maxImages);
    onImagesChange(newImages);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-300">
          Zdjęcia przedmiotów (max {maxImages})
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUploadClick}
          disabled={images.length >= maxImages}
          className="bg-[#1e1f2e] border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          <Upload className="h-4 w-4 mr-2" />
          Dodaj zdjęcia
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-[#1e1f2e] rounded border border-gray-600 overflow-hidden">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 text-center">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-500 mb-4" />
          <p className="text-sm text-gray-400 mb-2">
            Dodaj zdjęcia przedmiotów (max {maxImages})
          </p>
          <p className="text-xs text-gray-500">
            Kliknij "Dodaj zdjęcia" lub przeciągnij pliki tutaj
          </p>
        </div>
      )}

      <p className="text-xs text-gray-400">
        {images.length}/{maxImages} zdjęć • Maksymalnie 8 przedmiotów × 1 zdjęcie każdy
      </p>
    </div>
  );
}
