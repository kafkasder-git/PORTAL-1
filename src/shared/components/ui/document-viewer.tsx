/**
 * Document Viewer Component
 */

'use client';

import { useState } from 'react';
import { X, Download, Edit, Trash2, Clock, User, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';
import { Badge } from './badge';
import { Separator } from './separator';
import { ScrollArea } from './scroll-area';
import {
  Document,
  getDocumentDownloadUrl,
  getDocumentPreviewUrl,
  formatFileSize,
  getFileExtension,
  isViewableFile
} from '@/shared/lib/services/document.service';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface DocumentViewerProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (document: Document) => void;
  onDelete?: (document: Document) => void;
}

export function DocumentViewer({
  document,
  isOpen,
  onClose,
  onEdit,
  onDelete
}: DocumentViewerProps) {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  if (!document) return null;

  const handleDownload = async () => {
    try {
      if (!downloadUrl) {
        const url = await getDocumentDownloadUrl(document.fileId);
        setDownloadUrl(url);
        window.open(url, '_blank');
      } else {
        window.open(downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const loadPreview = async () => {
    if (!isViewableFile(document.mimeType)) {
      return;
    }

    try {
      const url = await getDocumentPreviewUrl(document.fileId);
      setPreviewUrl(url);
    } catch (error) {
      console.error('Preview error:', error);
    }
  };

  const getCategoryLabel = () => {
    const labels: Record<string, string> = {
      certificate: 'Sertifika',
      contract: 'Sözleşme',
      receipt: 'Fiş/Fatura',
      identity: 'Kimlik Belgesi',
      medical: 'Tıbbi Rapor',
      education: 'Eğitim Belgesi',
      report: 'Rapor',
      other: 'Diğer'
    };
    return labels[document.category] || document.category;
  };

  const getCategoryColor = () => {
    const colors: Record<string, string> = {
      certificate: 'bg-blue-100 text-blue-800',
      contract: 'bg-purple-100 text-purple-800',
      receipt: 'bg-green-100 text-green-800',
      identity: 'bg-orange-100 text-orange-800',
      medical: 'bg-red-100 text-red-800',
      education: 'bg-indigo-100 text-indigo-800',
      report: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[document.category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="truncate">{document.name}</span>
            <div className="flex items-center gap-2">
              <Badge className={getCategoryColor()}>
                {getCategoryLabel()}
              </Badge>
              {document.isConfidential && (
                <Badge variant="destructive">Gizli</Badge>
              )}
            </div>
          </DialogTitle>
          <DialogDescription>
            {document.description || 'Belge detayları'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
          {/* Preview */}
          <div className="lg:col-span-2 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
            {isViewableFile(document.mimeType) ? (
              previewUrl ? (
                <img
                  src={previewUrl}
                  alt={document.name}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-center p-8">
                  <Button onClick={loadPreview}>Önizlemeyi Yükle</Button>
                </div>
              )
            ) : (
              <div className="text-center p-8">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 mb-4">
                  Bu dosya türü önizlenemez
                </p>
                <Button onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  İndir
                </Button>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4 overflow-y-auto">
            <div className="space-y-2">
              <h3 className="font-semibold">Belge Bilgileri</h3>
              <Separator />
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-gray-500">Dosya Adı</dt>
                  <dd className="font-medium">{document.originalName}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Boyut</dt>
                  <dd className="font-medium">{formatFileSize(document.size)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Tür</dt>
                  <dd className="font-medium uppercase">.{getFileExtension(document.mimeType)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Yüklenme Tarihi</dt>
                  <dd className="font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(document.uploadedAt), 'dd MMMM yyyy, HH:mm', { locale: tr })}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Yükleyen</dt>
                  <dd className="font-medium flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {document.uploadedBy}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">İndirme Sayısı</dt>
                  <dd className="font-medium">{document.downloadCount}</dd>
                </div>
              </dl>
            </div>

            {document.tags.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Etiketler</h3>
                <Separator />
                <div className="flex flex-wrap gap-2">
                  {document.tags.map(tag => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {document.relatedEntity && (
              <div className="space-y-2">
                <h3 className="font-semibold">İlişkili Kayıt</h3>
                <Separator />
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Tür</p>
                  <p className="font-medium capitalize">{document.relatedEntity.type}</p>
                  <p className="text-sm text-gray-500 mt-2">ID</p>
                  <p className="font-medium">{document.relatedEntity.id}</p>
                </div>
              </div>
            )}

            {document.expiresAt && (
              <div className="space-y-2">
                <h3 className="font-semibold">Son Geçerlilik</h3>
                <Separator />
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    {format(new Date(document.expiresAt), 'dd MMMM yyyy', { locale: tr })}
                  </p>
                </div>
              </div>
            )}

            {document.versions.length > 1 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Versiyon Geçmişi</h3>
                <Separator />
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {document.versions
                      .sort((a, b) => b.version - a.version)
                      .map(version => (
                        <div
                          key={version.version}
                          className="p-2 border rounded text-sm"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">Versiyon {version.version}</span>
                            <Badge variant="outline">v{version.version}</Badge>
                          </div>
                          <p className="text-xs text-gray-500">
                            {format(new Date(version.createdAt), 'dd MMM yyyy', { locale: tr })}
                          </p>
                          {version.changeLog && (
                            <p className="text-xs mt-1">{version.changeLog}</p>
                          )}
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              İndir
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <Button variant="outline" onClick={() => onEdit(document)}>
                <Edit className="h-4 w-4 mr-2" />
                Düzenle
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                onClick={() => onDelete(document)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Sil
              </Button>
            )}
            <Button variant="ghost" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Kapat
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
