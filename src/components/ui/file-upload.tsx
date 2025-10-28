'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, FileText, Image, File, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateFile } from '@/lib/sanitization';

interface FileUploadProps {
  onFileSelect: (file: File | null, sanitizedFilename?: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  allowedTypes?: string[]; // MIME types
  allowedExtensions?: string[];
}

export function FileUpload({
  onFileSelect,
  accept = "*",
  maxSize = 10,
  placeholder = "Dosya seçin veya sürükleyin",
  className,
  disabled = false,
  allowedTypes,
  allowedExtensions,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFileUpload = (file: File): { valid: boolean; sanitizedFilename?: string } => {
    // Use advanced validation from sanitization library
    const validation = validateFile(file, {
      maxSize: maxSize * 1024 * 1024,
      allowedTypes,
      allowedExtensions,
    });

    if (!validation.valid) {
      setError(validation.error || 'Geçersiz dosya');
      return { valid: false };
    }

    // Additional security checks
    // Check for double extensions (e.g., file.pdf.exe)
    const parts = file.name.split('.');
    if (parts.length > 2) {
      setError('Dosya adı birden fazla uzantı içeremez');
      return { valid: false };
    }

    // Check for suspiciously long filenames
    if (file.name.length > 255) {
      setError('Dosya adı çok uzun');
      return { valid: false };
    }

    setError(null);
    return { valid: true, sanitizedFilename: validation.sanitizedFilename };
  };

  const handleFileSelect = (file: File | null) => {
    if (file) {
      const validation = validateFileUpload(file);
      if (validation.valid) {
        setSelectedFile(file);
        onFileSelect(file, validation.sanitizedFilename);
      }
    } else {
      setSelectedFile(null);
      onFileSelect(null);
      setError(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    onFileSelect(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-8 w-8 text-blue-500" />;
    } else if (file.type === 'application/pdf') {
      return <FileText className="h-8 w-8 text-red-500" />;
    } else {
      return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label>Dosya Yükleme</Label>

      {/* File Input */}
      <Input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        disabled={disabled}
        className="hidden"
      />

      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400",
          disabled && "opacity-50 cursor-not-allowed",
          error && "border-red-300 bg-red-50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        {selectedFile ? (
          <div className="flex items-center justify-center space-x-4">
            {getFileIcon(selectedFile)}
            <div className="text-left">
              <p className="font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
            </div>
            {!disabled && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">{placeholder}</p>
              <p className="text-xs text-gray-500">
                Maksimum {maxSize}MB • Desteklenen formatlar: {accept}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
