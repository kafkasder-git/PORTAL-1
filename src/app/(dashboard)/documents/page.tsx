/**
 * Document Management Page
 */

'use client';

import { useState } from 'react';
import { FileText, Upload, BarChart3 } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { DocumentUploader } from '@/shared/components/ui/document-uploader';
import { DocumentList } from '@/shared/components/ui/document-list';
import { DocumentViewer } from '@/shared/components/ui/document-viewer';
import type { Document } from '@/shared/lib/services/document.service';
import { toast } from 'sonner';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Mock document stats
  const stats = {
    total: documents.length,
    thisMonth: documents.filter(d => {
      const docDate = new Date(d.uploadedAt);
      const now = new Date();
      return docDate.getMonth() === now.getMonth() && docDate.getFullYear() === now.getFullYear();
    }).length,
    byCategory: {
      certificate: documents.filter(d => d.category === 'certificate').length,
      contract: documents.filter(d => d.category === 'contract').length,
      receipt: documents.filter(d => d.category === 'receipt').length,
      identity: documents.filter(d => d.category === 'identity').length,
      medical: documents.filter(d => d.category === 'medical').length,
      education: documents.filter(d => d.category === 'education').length,
      report: documents.filter(d => d.category === 'report').length,
      other: documents.filter(d => d.category === 'other').length
    }
  };

  const handleUpload = async (file: File, metadata: any) => {
    try {
      // In production, call uploadDocument service
      console.log('Uploading:', file.name, metadata);

      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Belge başarıyla yüklendi');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Belge yüklenirken hata oluştu');
      throw error;
    }
  };

  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document);
  };

  const handleDocumentDownload = (document: Document) => {
    console.log('Download:', document);
    toast.success('İndirme başlatılıyor...');
  };

  const handleDocumentDelete = (document: Document) => {
    if (window.confirm('Bu belgeyi silmek istediğinizden emin misiniz?')) {
      setDocuments(prev => prev.filter(d => d.id !== document.id));
      toast.success('Belge silindi');
    }
  };

  const handleDocumentEdit = (document: Document) => {
    console.log('Edit:', document);
    toast.info('Düzenleme özelliği yakında eklenecek');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Belge Yönetimi</h1>
          <p className="text-gray-500 mt-2">
            Belgelerinizi yükleyin, kategorize edin ve düzenleyin
          </p>
        </div>
        <Button onClick={() => setShowUploader(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Belge Yükle
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Toplam Belge</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Bu Ay Yüklenen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.thisMonth}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Sertifikalar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.byCategory.certificate}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-600">Sözleşmeler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.byCategory.contract}</div>
          </CardContent>
        </Card>
      </div>

      {/* Top Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Kategori Dağılımı
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.byCategory)
              .filter(([_, count]) => count > 0)
              .map(([category, count]) => {
                const labels: Record<string, string> = {
                  certificate: 'Sertifika',
                  contract: 'Sözleşme',
                  receipt: 'Fiş/Fatura',
                  identity: 'Kimlik',
                  medical: 'Tıbbi',
                  education: 'Eğitim',
                  report: 'Rapor',
                  other: 'Diğer'
                };
                return (
                  <Badge key={category} variant="outline">
                    {labels[category] || category}: {count}
                  </Badge>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Belgeler
          </CardTitle>
          <CardDescription>
            Toplam {documents.length} belge
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentList
            documents={documents}
            onSelect={handleDocumentSelect}
            onDownload={handleDocumentDownload}
            onDelete={handleDocumentDelete}
            onEdit={handleDocumentEdit}
            onUploadClick={() => setShowUploader(true)}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </CardContent>
      </Card>

      {/* Uploader Dialog */}
      <DocumentUploader
        isOpen={showUploader}
        onClose={() => setShowUploader(false)}
        onUpload={handleUpload}
      />

      {/* Viewer Dialog */}
      <DocumentViewer
        document={selectedDocument}
        isOpen={!!selectedDocument}
        onClose={() => setSelectedDocument(null)}
        onEdit={handleDocumentEdit}
        onDelete={handleDocumentDelete}
      />
    </div>
  );
}
