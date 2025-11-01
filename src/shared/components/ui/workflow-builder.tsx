/**
 * Workflow Builder Component
 */

'use client';

import { useState } from 'react';
import { Plus, Trash2, Play, Save, ArrowDown } from 'lucide-react';

import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Textarea } from './textarea';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
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
  WORKFLOW_TEMPLATES,
  type Workflow,
  type WorkflowTrigger,
  type WorkflowAction,
  type WorkflowCondition,
  type WorkflowActionConfig
} from '@/shared/lib/services/workflow.service';
import { cn } from '@/shared/lib/utils';

interface WorkflowBuilderProps {
  workflow?: Workflow;
  onSave?: (workflow: Partial<Workflow>) => void;
  onExecute?: (workflow: Workflow) => void;
}

const TRIGGER_OPTIONS = [
  { value: 'beneficiary_created', label: 'İhtiyaç Sahibi Oluşturuldu' },
  { value: 'donation_received', label: 'Bağış Alındı' },
  { value: 'aid_application_submitted', label: 'Yardım Başvurusu' },
  { value: 'task_assigned', label: 'Görev Atandı' },
  { value: 'meeting_scheduled', label: 'Toplantı Planlandı' },
  { value: 'deadline_approaching', label: 'Son Gün Yaklaşıyor' },
  { value: 'custom', label: 'Özel' }
];

const ACTION_OPTIONS = [
  { value: 'send_notification', label: 'Bildirim Gönder' },
  { value: 'create_task', label: 'Görev Oluştur' },
  { value: 'assign_user', label: 'Kullanıcı Ata' },
  { value: 'update_status', label: 'Durum Güncelle' },
  { value: 'send_email', label: 'E-posta Gönder' },
  { value: 'send_sms', label: 'SMS Gönder' },
  { value: 'generate_report', label: 'Rapor Oluştur' },
  { value: 'move_to_stage', label: 'Aşama Değiştir' }
];

export function WorkflowBuilder({
  workflow,
  onSave,
  onExecute
}: WorkflowBuilderProps) {
  const [name, setName] = useState(workflow?.name || '');
  const [description, setDescription] = useState(workflow?.description || '');
  const [trigger, setTrigger] = useState<WorkflowTrigger>(
    workflow?.trigger || 'beneficiary_created'
  );
  const [conditions, setConditions] = useState<WorkflowCondition[]>(
    workflow?.conditions || []
  );
  const [actions, setActions] = useState<WorkflowActionConfig[]>(
    workflow?.actions || []
  );
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [newAction, setNewAction] = useState<Partial<WorkflowActionConfig>>({
    type: 'send_notification',
    parameters: {}
  });

  const templates = WORKFLOW_TEMPLATES;

  const handleAddCondition = () => {
    setConditions([...conditions, { field: '', operator: 'equals', value: '' }]);
  };

  const handleUpdateCondition = (index: number, updates: Partial<WorkflowCondition>) => {
    setConditions(prev => prev.map((c, i) => i === index ? { ...c, ...updates } : c));
  };

  const handleRemoveCondition = (index: number) => {
    setConditions(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddAction = () => {
    setActions([...actions, newAction as WorkflowActionConfig]);
    setNewAction({ type: 'send_notification', parameters: {} });
    setShowActionDialog(false);
  };

  const handleRemoveAction = (index: number) => {
    setActions(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateActionParameter = (
    actionIndex: number,
    key: string,
    value: any
  ) => {
    setActions(prev => prev.map((action, i) => {
      if (i === actionIndex) {
        return {
          ...action,
          parameters: {
            ...action.parameters,
            [key]: value
          }
        };
      }
      return action;
    }));
  };

  const handleSave = () => {
    const workflowData: Partial<Workflow> = {
      name,
      description,
      trigger,
      conditions,
      actions,
      status: workflow?.status || 'draft'
    };
    onSave?.(workflowData);
  };

  const handleExecute = () => {
    if (workflow) {
      onExecute?.(workflow);
    }
  };

  const loadTemplate = (templateName: string) => {
    const template = templates[templateName as keyof typeof templates];
    if (template) {
      setName(template.name);
      setDescription(template.description);
      setTrigger(template.trigger);
      setConditions(template.conditions);
      setActions(template.actions);
      setSelectedTemplate(templateName);
    }
  };

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Başlangıç Şablonu Seçin (Opsiyonel)</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedTemplate} onValueChange={loadTemplate}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Bir şablon seçin veya boş başlayın" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(templates).map(([key, template]) => (
                <SelectItem key={key} value={key}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Temel Bilgiler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>İş Akışı Adı</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Yeni Bağış Karşılama"
            />
          </div>

          <div className="space-y-2">
            <Label>Açıklama</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Bu iş akışının ne yaptığını açıklayın..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Tetikleyici</Label>
            <Select value={trigger} onValueChange={(value) => setTrigger(value as WorkflowTrigger)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRIGGER_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Conditions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Koşullar</CardTitle>
            <Button variant="outline" size="sm" onClick={handleAddCondition}>
              <Plus className="h-4 w-4 mr-2" />
              Koşul Ekle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {conditions.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Henüz koşul eklenmedi. İş akışı her zaman tetiklenecektir.
            </p>
          ) : (
            <div className="space-y-3">
              {conditions.map((condition, index) => (
                <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                  <Input
                    value={condition.field}
                    onChange={(e) =>
                      handleUpdateCondition(index, { field: e.target.value })
                    }
                    placeholder="Alan (örn: status)"
                    className="flex-1"
                  />
                  <Select
                    value={condition.operator}
                    onValueChange={(value) =>
                      handleUpdateCondition(index, { operator: value as any })
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">Eşittir</SelectItem>
                      <SelectItem value="not_equals">Eşit Değildir</SelectItem>
                      <SelectItem value="greater_than">Büyüktür</SelectItem>
                      <SelectItem value="less_than">Küçüktür</SelectItem>
                      <SelectItem value="contains">İçerir</SelectItem>
                      <SelectItem value="exists">Mevcut</SelectItem>
                    </SelectContent>
                  </Select>
                  {condition.operator !== 'exists' && (
                    <Input
                      value={condition.value || ''}
                      onChange={(e) =>
                        handleUpdateCondition(index, { value: e.target.value })
                      }
                      placeholder="Değer"
                      className="w-40"
                    />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveCondition(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>İşlemler</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setShowActionDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              İşlem Ekle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {actions.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Henüz işlem eklenmedi. En az bir işlem eklemeniz gerekir.
            </p>
          ) : (
            <div className="space-y-4">
              {actions.map((action, actionIndex) => {
                const actionOption = ACTION_OPTIONS.find(
                  a => a.value === action.type
                );
                return (
                  <div key={actionIndex} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge>{actionOption?.label || action.type}</Badge>
                        <ArrowDown className="h-4 w-4 text-gray-400" />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveAction(actionIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Action Parameters */}
                    <div className="ml-6 space-y-2">
                      {action.type === 'send_notification' && (
                        <>
                          <Input
                            value={action.parameters.title || ''}
                            onChange={(e) =>
                              handleUpdateActionParameter(actionIndex, 'title', e.target.value)
                            }
                            placeholder="Bildirim başlığı"
                          />
                          <Input
                            value={action.parameters.message || ''}
                            onChange={(e) =>
                              handleUpdateActionParameter(actionIndex, 'message', e.target.value)
                            }
                            placeholder="Bildirim mesajı"
                          />
                        </>
                      )}

                      {action.type === 'create_task' && (
                        <>
                          <Input
                            value={action.parameters.title || ''}
                            onChange={(e) =>
                              handleUpdateActionParameter(actionIndex, 'title', e.target.value)
                            }
                            placeholder="Görev başlığı"
                          />
                          <Textarea
                            value={action.parameters.description || ''}
                            onChange={(e) =>
                              handleUpdateActionParameter(actionIndex, 'description', e.target.value)
                            }
                            placeholder="Görev açıklaması"
                            rows={2}
                          />
                          <Select
                            value={action.parameters.priority || 'normal'}
                            onValueChange={(value) =>
                              handleUpdateActionParameter(actionIndex, 'priority', value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Öncelik" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Düşük</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="high">Yüksek</SelectItem>
                              <SelectItem value="urgent">Acil</SelectItem>
                            </SelectContent>
                          </Select>
                        </>
                      )}

                      {action.type === 'send_email' && (
                        <>
                          <Input
                            value={action.parameters.to || ''}
                            onChange={(e) =>
                              handleUpdateActionParameter(actionIndex, 'to', e.target.value)
                            }
                            placeholder="Alıcı (örn: {{email}})"
                          />
                          <Input
                            value={action.parameters.subject || ''}
                            onChange={(e) =>
                              handleUpdateActionParameter(actionIndex, 'subject', e.target.value)
                            }
                            placeholder="Konu"
                          />
                        </>
                      )}

                      {action.type === 'update_status' && (
                        <>
                          <Input
                            value={action.parameters.entityType || ''}
                            onChange={(e) =>
                              handleUpdateActionParameter(actionIndex, 'entityType', e.target.value)
                            }
                            placeholder="Varlık türü (örn: task)"
                          />
                          <Input
                            value={action.parameters.status || ''}
                            onChange={(e) =>
                              handleUpdateActionParameter(actionIndex, 'status', e.target.value)
                            }
                            placeholder="Yeni durum"
                          />
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {workflow && (
            <Button variant="outline" onClick={handleExecute}>
              <Play className="h-4 w-4 mr-2" />
              Test Et
            </Button>
          )}
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Kaydet
        </Button>
      </div>

      {/* Add Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni İşlem Ekle</DialogTitle>
            <DialogDescription>
              İş akışına eklenecek işlemi seçin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>İşlem Türü</Label>
              <Select
                value={newAction.type}
                onValueChange={(value) =>
                  setNewAction({ ...newAction, type: value as WorkflowAction, parameters: {} })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionDialog(false)}>
              İptal
            </Button>
            <Button onClick={handleAddAction}>Ekle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

