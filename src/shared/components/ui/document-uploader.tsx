/**
 * Document Upload Component
 */

'use client';

import { useState, useCallback } from 'react';
import { Upload, X, File, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { Textarea } from './textarea';
import { Switch } from './switch';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './dialog';
import {
  getDocumentCategories,
  validateFile,
  type DocumentCategory,
  type DocumentMetadata
} from '@/shared/lib/services/document.service';
import { formatFileSize } from '@/shared/lib/services/document.service';
import { toast } from 'sonner';

interface DocumentUploaderProps {
  onUpload?: (file: File, metadata: DocumentMetadata) => Promise<void>;
  onClose?: () => void;
  isOpen?: boolean;
  relatedEntity?: {
    type: 'beneficiary' | 'donation' | 'task' | 'meeting' | 'user';
    id: string;
  };
}

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export function DocumentUploader({
  onUpload,
  onClose,
  isOpen = true,
  relatedEntity
}: DocumentUploaderProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [metadata, setMetadata] = useState<Partial<DocumentMetadata>>({
    category: 'other',
    tags: [],
    isConfidential: false
  });
  const [isDragging, setIsDragging] = useState(false);

  const categories = getDocumentCategories();

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: UploadFile[] = Array.from(selectedFiles).map(file => {
      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error(`${file.name}: ${validation.error}`);
        return null;
      }

      return {
        file,
        id: crypto.randomUUID(),
        progress: 0,
        status: 'pending' as const
      };
    }).filter(Boolean) as UploadFile[];

    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const updateFileStatus = (id: string, updates: Partial<UploadFile>) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Lütfen en az bir dosya seçin');
      return;
    }

    if (!metadata.category) {
      toast.error('Lütfen bir kategori seçin');
      return;
    }

    for (const uploadFile of files) {
      try {
        updateFileStatus(uploadFile.id, { status: 'uploading', progress: 0 });

        if (onUpload) {
          await onUpload(uploadFile.file, {
            name: uploadFile.file.name,
            category: metadata.category as DocumentCategory,
            description: metadata.description,
            tags: metadata.tags,
            relatedEntity,
            isConfidential: metadata.isConfidential,
            expiresAt: metadata.expiresAt
          });
        }

        updateFileStatus(uploadFile.id, { status: 'success', progress: 100 });
      } catch (error: any) {
        console.error('Upload error:', error);
        updateFileStatus(uploadFile.id, {
          status: 'error',
          error: error.message || 'Upload failed'
        });
        toast.error(`Upload failed: ${uploadFile.file.name}`);
      }
    }

    toast.success('Tüm dosyalar yüklendi');
    setFiles([]);
    onClose?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Belge Yükle</DialogTitle>
          <DialogDescription>
            Dosyalarınızı sisteme yükleyin ve kategorilere ayırın
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">Dosyaları buraya sürükleyin</p>
            <p className="text-sm text-gray-500 mb-4">
              veya
            </p>
            <Input
              type="file"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              id="file-upload"
            />
            <Label htmlFor="file-upload">
              <Button variant="outline" className="cursor-pointer">
                Dosya Seç
              </Button>
            </Label>
            <p className="text-xs text-gray-500 mt-4">
              Desteklenen formatlar: JPG, PNG, GIF, PDF, DOC, DOCX, XLS, XLSX, TXT
              <br />
              Maksimum dosya boyutu: 10MB
            </p>
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="space-y-2">
              <Label>Seçili Dosyalar</Label>
              {files.map(uploadFile => (
                <Card key={uploadFile.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <File className="h-8 w-8 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{uploadFile.file.name}</p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(uploadFile.file.size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {uploadFile.status === 'pending' && (
                          <Badge variant="outline">Bekliyor</Badge>
                        )}
                        {uploadFile.status === 'uploading' && (
                          <Badge variant="secondary">Yükleniyor</Badge>
                        )}
                        {uploadFile.status === 'success' && (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Tamamlandı
                          </Badge>
                        )}
                        {uploadFile.status === 'error' && (
                          <Badge variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Hata
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(uploadFile.id)}
                          disabled={uploadFile.status === 'uploading'}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {uploadFile.status === 'uploading' && (
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${uploadFile.progress}%` }}
                        />
                      </div>
                    )}
                    {uploadFile.status === 'error' && uploadFile.error && (
                      <p className="text-sm text-red-500 mt-1">{uploadFile.error}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Metadata Form */}
          {files.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium">Belge Bilgileri</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Select
                    value={metadata.category}
                    onValueChange={(value) =>
                      setMetadata(prev => ({ ...prev, category: value as DocumentCategory }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Etiketler (virgülle ayırın)</Label>
                  <Input
                    placeholder="etiket1, etiket2"
                    onChange={(e) =>
                      setMetadata(prev => ({
                        ...prev,
                        tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Açıklama</Label>
                <Textarea
                  placeholder="Belge hakkında kısa açıklama..."
                  value={metadata.description}
                  onChange={(e) =>
                    setMetadata(prev => ({ ...prev, description: e.target.value }))
                  }
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Son Geçerlilik Tarihi (Opsiyonel)</Label>
                  <Input
                    type="date"
                    value={metadata.expiresAt}
                    onChange={(e) =>
                      setMetadata(prev => ({ ...prev, expiresAt: e.target.value }))
                    }
                  />
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="confidential"
                    checked={metadata.isConfidential}
                    onCheckedChange={(checked) =>
                      setMetadata(prev => ({ ...prev, isConfidential: checked }))
                    }
                  />
                  <Label htmlFor="confidential">Gizli Belge</Label>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            İptal
          </Button>
          <Button onClick={handleUpload} disabled={files.length === 0}>
            Yükle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
