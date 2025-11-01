/**
 * Automated Workflow Engine
 * Handles automated processes and workflows
 */

import { appwriteApi } from '@/shared/lib/api/appwrite-api';

export type WorkflowTrigger =
  | 'beneficiary_created'
  | 'donation_received'
  | 'aid_application_submitted'
  | 'task_assigned'
  | 'meeting_scheduled'
  | 'deadline_approaching'
  | 'custom';

export type WorkflowAction =
  | 'send_notification'
  | 'create_task'
  | 'assign_user'
  | 'update_status'
  | 'send_email'
  | 'send_sms'
  | 'generate_report'
  | 'move_to_stage'
  | 'create_document'
  | 'call_api';

export type WorkflowStatus = 'active' | 'inactive' | 'draft' | 'testing';

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'exists';
  value?: any;
}

export interface WorkflowActionConfig {
  type: WorkflowAction;
  parameters: Record<string, any>;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  conditions: WorkflowCondition[];
  actions: WorkflowActionConfig[];
  status: WorkflowStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  executionCount: number;
  lastExecuted?: string;
  isEnabled: boolean;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  trigger: WorkflowTrigger;
  status: 'success' | 'failed' | 'pending';
  startedAt: string;
  completedAt?: string;
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
}

export interface CreateWorkflowDto {
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  conditions: WorkflowCondition[];
  actions: WorkflowActionConfig[];
}

/**
 * Create a new workflow
 */
export async function createWorkflow(
  data: CreateWorkflowDto,
  userId: string
): Promise<Workflow> {
  // In production, save to 'workflows' collection in Appwrite
  const workflow: Workflow = {
    id: crypto.randomUUID(),
    name: data.name,
    description: data.description,
    trigger: data.trigger,
    conditions: data.conditions,
    actions: data.actions,
    status: 'active',
    createdBy: userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    executionCount: 0,
    isEnabled: true
  };

  console.log('Creating workflow:', workflow);
  return workflow;
}

/**
 * Get all workflows
 */
export async function getWorkflows(): Promise<Workflow[]> {
  // In production, fetch from 'workflows' collection
  return [];
}

/**
 * Get workflow by ID
 */
export async function getWorkflow(id: string): Promise<Workflow | null> {
  // In production, fetch from 'workflows' collection
  return null;
}

/**
 * Update workflow
 */
export async function updateWorkflow(
  id: string,
  updates: Partial<CreateWorkflowDto>,
  userId: string
): Promise<Workflow> {
  // In production, update in 'workflows' collection
  const workflow = await getWorkflow(id);
  if (!workflow) {
    throw new Error('Workflow not found');
  }

  return {
    ...workflow,
    ...updates,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Delete workflow
 */
export async function deleteWorkflow(id: string): Promise<void> {
  // In production, delete from 'workflows' collection
  console.log('Deleting workflow:', id);
}

/**
 * Execute workflow
 */
export async function executeWorkflow(
  workflow: Workflow,
  input: Record<string, any>
): Promise<WorkflowExecution> {
  const execution: WorkflowExecution = {
    id: crypto.randomUUID(),
    workflowId: workflow.id,
    trigger: workflow.trigger,
    status: 'pending',
    startedAt: new Date().toISOString(),
    input
  };

  try {
    console.log(`Executing workflow: ${workflow.name}`, { input });

    // Check conditions
    const conditionsMet = await evaluateConditions(workflow.conditions, input);
    if (!conditionsMet) {
      execution.status = 'failed';
      execution.error = 'Conditions not met';
      execution.completedAt = new Date().toISOString();
      return execution;
    }

    // Execute actions sequentially
    const outputs: Record<string, any> = {};
    for (const action of workflow.actions) {
      const output = await executeAction(action, input, outputs);
      outputs[action.type] = output;
    }

    execution.status = 'success';
    execution.output = outputs;
    execution.completedAt = new Date().toISOString();

    // Update workflow execution count
    await updateWorkflowExecutionCount(workflow.id);

    return execution;
  } catch (error: any) {
    execution.status = 'failed';
    execution.error = error.message;
    execution.completedAt = new Date().toISOString();
    console.error('Workflow execution error:', error);
    return execution;
  }
}

/**
 * Evaluate workflow conditions
 */
async function evaluateConditions(
  conditions: WorkflowCondition[],
  input: Record<string, any>
): Promise<boolean> {
  for (const condition of conditions) {
    const value = getNestedValue(input, condition.field);
    const matches = compareValues(value, condition.operator, condition.value);

    if (!matches) {
      return false;
    }
  }
  return true;
}

/**
 * Execute a single workflow action
 */
async function executeAction(
  action: WorkflowActionConfig,
  input: Record<string, any>,
  previousOutputs: Record<string, any>
): Promise<any> {
  switch (action.type) {
    case 'send_notification':
      return executeSendNotification(action.parameters, input);

    case 'create_task':
      return executeCreateTask(action.parameters, input);

    case 'assign_user':
      return executeAssignUser(action.parameters, input);

    case 'update_status':
      return executeUpdateStatus(action.parameters, input);

    case 'send_email':
      return executeSendEmail(action.parameters, input);

    case 'send_sms':
      return executeSendSms(action.parameters, input);

    case 'generate_report':
      return executeGenerateReport(action.parameters, input);

    case 'move_to_stage':
      return executeMoveToStage(action.parameters, input);

    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

/**
 * Send notification action
 */
async function executeSendNotification(
  params: Record<string, any>,
  input: Record<string, any>
): Promise<any> {
  const { userId, type, title, message } = params;
  console.log('Sending notification:', { userId, type, title });

  // In production, create notification in database
  return { success: true, userId, type };
}

/**
 * Create task action
 */
async function executeCreateTask(
  params: Record<string, any>,
  input: Record<string, any>
): Promise<any> {
  const { title, description, assignedTo, priority } = params;

  const taskData = {
    title,
    description: description || input.description,
    assigned_to: assignedTo,
    priority: priority || 'normal',
    status: 'pending',
    created_by: 'workflow-system'
  };

  const result = await appwriteApi.tasks.createTask(taskData);
  return result;
}

/**
 * Assign user action
 */
async function executeAssignUser(
  params: Record<string, any>,
  input: Record<string, any>
): Promise<any> {
  const { entityType, entityId, userId, role } = params;
  console.log('Assigning user:', { entityType, entityId, userId, role });

  // In production, update entity with new assignee
  return { success: true, entityType, entityId, userId, role };
}

/**
 * Update status action
 */
async function executeUpdateStatus(
  params: Record<string, any>,
  input: Record<string, any>
): Promise<any> {
  const { entityType, entityId, status } = params;

  let result;
  switch (entityType) {
    case 'task':
      result = await appwriteApi.tasks.updateTask(entityId, { status });
      break;
    case 'meeting':
      result = await appwriteApi.meetings.updateMeeting(entityId, { status });
      break;
    default:
      throw new Error(`Unsupported entity type: ${entityType}`);
  }

  return result;
}

/**
 * Send email action
 */
async function executeSendEmail(
  params: Record<string, any>,
  input: Record<string, any>
): Promise<any> {
  const { to, subject, template, data } = params;
  console.log('Sending email:', { to, subject, template });

  // In production, integrate with email service (SendGrid, Mailgun, etc.)
  return { success: true, to, subject };
}

/**
 * Send SMS action
 */
async function executeSendSms(
  params: Record<string, any>,
  input: Record<string, any>
): Promise<any> {
  const { to, message } = params;
  console.log('Sending SMS:', { to, message });

  // In production, integrate with SMS service (Twilio, etc.)
  return { success: true, to };
}

/**
 * Generate report action
 */
async function executeGenerateReport(
  params: Record<string, any>,
  input: Record<string, any>
): Promise<any> {
  const { type, format, filters } = params;
  console.log('Generating report:', { type, format, filters });

  // In production, generate report using reporting service
  return { success: true, type, format };
}

/**
 * Move to stage action (for aid applications)
 */
async function executeMoveToStage(
  params: Record<string, any>,
  input: Record<string, any>
): Promise<any> {
  const { applicationId, stage } = params;
  console.log('Moving to stage:', { applicationId, stage });

  // In production, update aid application stage
  return { success: true, applicationId, stage };
}

/**
 * Update workflow execution count
 */
async function updateWorkflowExecutionCount(workflowId: string): Promise<void> {
  // In production, increment execution count in database
  console.log('Updating workflow execution count:', workflowId);
}

/**
 * Get workflow executions
 */
export async function getWorkflowExecutions(
  workflowId?: string
): Promise<WorkflowExecution[]> {
  // In production, fetch from 'workflow_executions' collection
  return [];
}

/**
 * Helper: Get nested value from object
 */
function getNestedValue(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Helper: Compare values based on operator
 */
function compareValues(value: any, operator: WorkflowCondition['operator'], compareTo: any): boolean {
  switch (operator) {
    case 'equals':
      return value === compareTo;
    case 'not_equals':
      return value !== compareTo;
    case 'greater_than':
      return value > compareTo;
    case 'less_than':
      return value < compareTo;
    case 'contains':
      return String(value).includes(String(compareTo));
    case 'exists':
      return value !== undefined && value !== null;
    default:
      return false;
  }
}

/**
 * Built-in workflow templates
 */
export const WORKFLOW_TEMPLATES = {
  // Welcome workflow for new beneficiaries
  beneficiaryWelcome: {
    name: 'Yeni İhtiyaç Sahibi Karşılama',
    description: 'Yeni ihtiyaç sahibi kaydında otomatik görev oluştur',
    trigger: 'beneficiary_created' as WorkflowTrigger,
    conditions: [
      { field: 'status', operator: 'equals' as const, value: 'AKTIF' }
    ],
    actions: [
      {
        type: 'create_task' as WorkflowAction,
        parameters: {
          title: 'Yeni İhtiyaç Sahibini Görüşme',
          description: 'Kayıt sonrası görüşme planla',
          assignedTo: '', // Will be filled
          priority: 'normal' as const
        }
      },
      {
        type: 'send_notification' as WorkflowAction,
        parameters: {
          type: 'beneficiary_registered',
          title: 'Yeni İhtiyaç Sahibi',
          message: 'Yeni bir ihtiyaç sahibi kaydoldu'
        }
      }
    ]
  },

  // Donation receipt workflow
  donationReceipt: {
    name: 'Bağış Makbuzu Gönder',
    description: 'Bağış alındığında otomatik teşekkür mesajı gönder',
    trigger: 'donation_received' as WorkflowTrigger,
    conditions: [
      { field: 'status', operator: 'equals' as const, value: 'completed' }
    ],
    actions: [
      {
        type: 'send_email' as WorkflowAction,
        parameters: {
          to: '{{donor_email}}',
          subject: 'Bağışınız İçin Teşekkürler',
          template: 'donation_receipt',
          data: {
            donorName: '{{donor_name}}',
            amount: '{{amount}}',
            date: '{{date}}'
          }
        }
      },
      {
        type: 'create_task' as WorkflowAction,
        parameters: {
          title: 'Bağış Takibi',
          description: 'Bağış sonrası takip işlemlerini yap',
          priority: 'low' as const
        }
      }
    ]
  },

  // Task deadline reminder
  taskDeadlineReminder: {
    name: 'Görev Son Gün Hatırlatması',
    description: 'Görev son günü yaklaştığında hatırlatma gönder',
    trigger: 'deadline_approaching' as WorkflowTrigger,
    conditions: [
      { field: 'days_until_due', operator: 'less_than' as const, value: 2 }
    ],
    actions: [
      {
        type: 'send_notification' as WorkflowAction,
        parameters: {
          type: 'deadline_reminder',
          title: 'Görev Son Günü Yaklaşıyor',
          message: '{{title}} görevinin son günü {{due_date}}'
        }
      },
      {
        type: 'send_email' as WorkflowAction,
        parameters: {
          to: '{{assignee_email}}',
          subject: 'Görev Hatırlatması: {{title}}',
          template: 'task_reminder',
          data: {
            title: '{{title}}',
            dueDate: '{{due_date}}',
            description: '{{description}}'
          }
        }
      }
    ]
  },

  // Aid application review
  aidApplicationReview: {
    name: 'Yardım Başvurusu Değerlendirme',
    description: 'Yeni yardım başvurusu için değerlendirme görevi oluştur',
    trigger: 'aid_application_submitted' as WorkflowTrigger,
    conditions: [
      { field: 'stage', operator: 'equals' as const, value: 'draft' }
    ],
    actions: [
      {
        type: 'create_task' as WorkflowAction,
        parameters: {
          title: 'Yardım Başvurusu Değerlendir',
          description: 'Yardım başvurusunu incele ve karar ver',
          priority: 'high' as const
        }
      },
      {
        type: 'move_to_stage' as WorkflowAction,
        parameters: {
          stage: 'under_review'
        }
      },
      {
        type: 'send_notification' as WorkflowAction,
        parameters: {
          type: 'aid_application',
          title: 'Yeni Yardım Başvurusu',
          message: 'Yeni bir yardım başvurusu değerlendirme bekliyor'
        }
      }
    ]
  }
};
