/**
 * Workflow Management Page
 */

'use client';

import { useState, useEffect } from 'react';
import { Plus, Play, Settings, Trash2, Edit, CheckCircle, XCircle, Clock } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { WorkflowBuilder } from '@/shared/components/ui/workflow-builder';
import { type Workflow } from '@/shared/lib/services/workflow.service';
import { toast } from 'sonner';

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);

  const loadWorkflows = async () => {
    try {
      const response = await fetch('/api/workflows');
      const data = await response.json();

      if (data.success) {
        setWorkflows(data.data);
      } else {
        toast.error(data.error || 'İş akışları yüklenemedi');
      }
    } catch (error) {
      console.error('Load workflows error:', error);
      toast.error('İş akışları yüklenirken hata oluştu');
    }
  };

  // Load workflows on mount
  useEffect(() => {
    loadWorkflows();
  }, []);

  const handleCreateWorkflow = async (workflowData: Partial<Workflow>) => {
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflowData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || 'İş akışı oluşturuldu');
        setShowBuilder(false);
        loadWorkflows(); // Reload workflows
      } else {
        toast.error(data.error || 'İş akışı oluşturulamadı');
      }
    } catch (error) {
      console.error('Create workflow error:', error);
      toast.error('İş akışı oluşturulurken hata oluştu');
    }
  };

  const handleUpdateWorkflow = async (workflowData: Partial<Workflow>) => {
    if (!editingWorkflow) return;

    try {
      const response = await fetch(`/api/workflows/${editingWorkflow.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflowData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || 'İş akışı güncellendi');
        setEditingWorkflow(null);
        loadWorkflows(); // Reload workflows
      } else {
        toast.error(data.error || 'İş akışı güncellenemedi');
      }
    } catch (error) {
      console.error('Update workflow error:', error);
      toast.error('İş akışı güncellenirken hata oluştu');
    }
  };

  const handleDeleteWorkflow = async (workflow: Workflow) => {
    if (window.confirm('Bu iş akışını silmek istediğinizden emin misiniz?')) {
      try {
        const response = await fetch(`/api/workflows/${workflow.id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
          toast.success(data.message || 'İş akışı silindi');
          loadWorkflows(); // Reload workflows
        } else {
        toast.error(data.error || 'İş akışı silinemedi');
        }
      } catch (error) {
        console.error('Delete workflow error:', error);
        toast.error('İş akışı silinirken hata oluştu');
      }
    }
  };

  const handleExecuteWorkflow = async (workflow: Workflow) => {
    try {
      const response = await fetch(`/api/workflows/${workflow.id}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: { test: true } }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || 'İş akışı başarıyla test edildi');
        loadWorkflows(); // Reload to update execution count
      } else {
        toast.error(data.error || 'İş akışı test edilemedi');
      }
    } catch (error) {
      console.error('Execute workflow error:', error);
      toast.error('İş akışı çalıştırılırken hata oluştu');
    }
  };

  const getStatusIcon = (status: Workflow['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'testing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Workflow['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'testing':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTriggerLabel = (trigger: Workflow['trigger']) => {
    const labels: Record<Workflow['trigger'], string> = {
      beneficiary_created: 'İhtiyaç Sahibi Oluşturuldu',
      donation_received: 'Bağış Alındı',
      aid_application_submitted: 'Yardım Başvurusu',
      task_assigned: 'Görev Atandı',
      meeting_scheduled: 'Toplantı Planlandı',
      deadline_approaching: 'Son Gün Yaklaşıyor',
      custom: 'Özel'
    };
    return labels[trigger];
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">İş Akışı Yönetimi</h1>
          <p className="text-gray-500 mt-2">
            Otomatik iş akışlarını oluşturun ve yönetin
          </p>
        </div>
        <Button onClick={() => setShowBuilder(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni İş Akışı
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Toplam İş Akışı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workflows.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {workflows.filter(w => w.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">Test Modunda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {workflows.filter(w => w.status === 'testing').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Toplam Çalıştırma</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {workflows.reduce((sum, w) => sum + w.executionCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflows List */}
      <Card>
        <CardHeader>
          <CardTitle>İş Akışları</CardTitle>
          <CardDescription>Toplam {workflows.length} iş akışı</CardDescription>
        </CardHeader>
        <CardContent>
          {workflows.length === 0 ? (
            <div className="text-center py-12">
              <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 mb-4">Henüz iş akışı oluşturulmadı</p>
              <Button onClick={() => setShowBuilder(true)}>
                <Plus className="h-4 w-4 mr-2" />
                İlk İş Akışını Oluştur
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {workflows.map(workflow => (
                <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{workflow.name}</h3>
                          {getStatusIcon(workflow.status)}
                          <Badge className={getStatusColor(workflow.status)}>
                            {workflow.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{workflow.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Tetikleyici:</span>
                            <span>{getTriggerLabel(workflow.trigger)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Çalıştırma:</span>
                            <span>{workflow.executionCount} kez</span>
                          </div>
                          {workflow.lastExecuted && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Son:</span>
                              <span>
                                {new Date(workflow.lastExecuted).toLocaleDateString('tr-TR')}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">
                            {workflow.conditions.length} koşul
                          </Badge>
                          <Badge variant="outline">
                            {workflow.actions.length} işlem
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExecuteWorkflow(workflow)}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Test
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingWorkflow(workflow)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Düzenle
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteWorkflow(workflow)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Workflow Dialog */}
      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni İş Akışı Oluştur</DialogTitle>
            <DialogDescription>
              Otomatik iş akışınızı oluşturun ve yapılandırın
            </DialogDescription>
          </DialogHeader>
          <WorkflowBuilder
            onSave={handleCreateWorkflow}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Workflow Dialog */}
      <Dialog open={!!editingWorkflow} onOpenChange={(open) => !open && setEditingWorkflow(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>İş Akışını Düzenle</DialogTitle>
            <DialogDescription>
              {editingWorkflow?.name} iş akışını güncelleyin
            </DialogDescription>
          </DialogHeader>
          {editingWorkflow && (
            <WorkflowBuilder
              workflow={editingWorkflow}
              onSave={handleUpdateWorkflow}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
