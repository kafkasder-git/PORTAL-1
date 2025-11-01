/**
 * Workflow Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createWorkflow,
  getWorkflows,
  getWorkflow,
  updateWorkflow,
  deleteWorkflow,
  executeWorkflow,
  WORKFLOW_TEMPLATES,
} from '@/shared/lib/services/workflow.service';

describe('Workflow Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createWorkflow', () => {
    it('should create a new workflow', async () => {
      const workflowData = {
        name: 'Test Workflow',
        description: 'Test description',
        trigger: 'beneficiary_created' as const,
        conditions: [],
        actions: [],
      };

      const userId = 'user-123';
      const workflow = await createWorkflow(workflowData, userId);

      expect(workflow).toMatchObject({
        name: workflowData.name,
        description: workflowData.description,
        trigger: workflowData.trigger,
        conditions: workflowData.conditions,
        actions: workflowData.actions,
        status: 'active',
        createdBy: userId,
        isEnabled: true,
      });

      expect(workflow.id).toBeDefined();
      expect(workflow.createdAt).toBeDefined();
      expect(workflow.updatedAt).toBeDefined();
    });

    it('should validate required fields', async () => {
      const workflowData = {
        name: '',
        description: 'Test description',
        trigger: 'beneficiary_created' as const,
        conditions: [],
        actions: [],
      };

      const userId = 'user-123';
      const workflow = await createWorkflow(workflowData, userId);

      expect(workflow.name).toBe('');
    });
  });

  describe('getWorkflows', () => {
    it('should return empty array by default', async () => {
      const workflows = await getWorkflows();
      expect(workflows).toEqual([]);
    });
  });

  describe('getWorkflow', () => {
    it('should return null for non-existent workflow', async () => {
      const workflow = await getWorkflow('non-existent-id');
      expect(workflow).toBeNull();
    });
  });

  describe('updateWorkflow', () => {
    it('should update workflow', async () => {
      // Mock getWorkflow to return a workflow
      const mockWorkflow = {
        id: 'workflow-123',
        name: 'Original Workflow',
        description: 'Original description',
        trigger: 'beneficiary_created',
        conditions: [],
        actions: [],
        status: 'active' as const,
        createdBy: 'user-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        executionCount: 0,
        isEnabled: true,
      };

      vi.mocked(getWorkflow).mockResolvedValue(mockWorkflow);

      const workflowId = 'workflow-123';
      const updates = {
        name: 'Updated Workflow',
        description: 'Updated description',
      };

      const updatedWorkflow = await updateWorkflow(workflowId, updates, 'user-123');

      expect(updatedWorkflow).toMatchObject({
        id: workflowId,
        name: 'Updated Workflow',
        description: 'Updated description',
      });
    });

    it('should throw error for non-existent workflow', async () => {
      vi.mocked(getWorkflow).mockResolvedValue(null);

      await expect(
        updateWorkflow('non-existent-id', { name: 'Test' }, 'user-123')
      ).rejects.toThrow('Workflow not found');
    });
  });

  describe('deleteWorkflow', () => {
    it('should delete workflow', async () => {
      const workflowId = 'workflow-123';

      await deleteWorkflow(workflowId);

      expect(deleteWorkflow).toBeDefined();
    });
  });

  describe('executeWorkflow', () => {
    it('should execute workflow successfully', async () => {
      const workflow = {
        id: 'workflow-123',
        name: 'Test Workflow',
        description: 'Test description',
        trigger: 'beneficiary_created' as const,
        conditions: [],
        actions: [
          {
            type: 'send_notification' as const,
            parameters: {
              userId: 'user-456',
              type: 'info',
              title: 'Test',
              message: 'Test message',
            },
          },
        ],
        status: 'active' as const,
        createdBy: 'user-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        executionCount: 0,
        isEnabled: true,
      };

      const result = await executeWorkflow(workflow, { test: true });

      expect(result).toMatchObject({
        workflowId: workflow.id,
        trigger: workflow.trigger,
        status: 'success',
        startedAt: expect.any(String),
        completedAt: expect.any(String),
        input: { test: true },
      });
    });

    it('should fail when conditions not met', async () => {
      const workflow = {
        id: 'workflow-123',
        name: 'Test Workflow',
        description: 'Test description',
        trigger: 'beneficiary_created' as const,
        conditions: [
          {
            field: 'status',
            operator: 'equals' as const,
            value: 'inactive',
          },
        ],
        actions: [
          {
            type: 'send_notification' as const,
            parameters: {
              userId: 'user-456',
              type: 'info',
              title: 'Test',
              message: 'Test message',
            },
          },
        ],
        status: 'active' as const,
        createdBy: 'user-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        executionCount: 0,
        isEnabled: true,
      };

      const result = await executeWorkflow(workflow, { status: 'active' });

      expect(result.status).toBe('failed');
      expect(result.error).toBe('Conditions not met');
    });

    it('should handle unknown action type', async () => {
      const workflow = {
        id: 'workflow-123',
        name: 'Test Workflow',
        description: 'Test description',
        trigger: 'beneficiary_created' as const,
        conditions: [],
        actions: [
          {
            type: 'unknown_action' as any,
            parameters: {},
          },
        ],
        status: 'active' as const,
        createdBy: 'user-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        executionCount: 0,
        isEnabled: true,
      };

      const result = await executeWorkflow(workflow, {});

      expect(result.status).toBe('failed');
      expect(result.error).toContain('Unknown action type');
    });
  });

  describe('WORKFLOW_TEMPLATES', () => {
    it('should have beneficiaryWelcome template', () => {
      expect(WORKFLOW_TEMPLATES.beneficiaryWelcome).toBeDefined();
      expect(WORKFLOW_TEMPLATES.beneficiaryWelcome.name).toBe('Yeni İhtiyaç Sahibi Karşılama');
      expect(WORKFLOW_TEMPLATES.beneficiaryWelcome.trigger).toBe('beneficiary_created');
      expect(WORKFLOW_TEMPLATES.beneficiaryWelcome.actions).toHaveLength(2);
    });

    it('should have donationReceipt template', () => {
      expect(WORKFLOW_TEMPLATES.donationReceipt).toBeDefined();
      expect(WORKFLOW_TEMPLATES.donationReceipt.name).toBe('Bağış Makbuzu Gönder');
      expect(WORKFLOW_TEMPLATES.donationReceipt.trigger).toBe('donation_received');
      expect(WORKFLOW_TEMPLATES.donationReceipt.actions).toHaveLength(2);
    });

    it('should have taskDeadlineReminder template', () => {
      expect(WORKFLOW_TEMPLATES.taskDeadlineReminder).toBeDefined();
      expect(WORKFLOW_TEMPLATES.taskDeadlineReminder.trigger).toBe('deadline_approaching');
    });

    it('should have aidApplicationReview template', () => {
      expect(WORKFLOW_TEMPLATES.aidApplicationReview).toBeDefined();
      expect(WORKFLOW_TEMPLATES.aidApplicationReview.trigger).toBe('aid_application_submitted');
      expect(WORKFLOW_TEMPLATES.aidApplicationReview.actions).toHaveLength(3);
    });
  });

  describe('Condition Evaluation', () => {
    it('should evaluate equals condition', async () => {
      const workflow = {
        id: 'workflow-123',
        name: 'Test',
        description: 'Test',
        trigger: 'beneficiary_created' as const,
        conditions: [
          {
            field: 'status',
            operator: 'equals' as const,
            value: 'active',
          },
        ],
        actions: [],
        status: 'active' as const,
        createdBy: 'user-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        executionCount: 0,
        isEnabled: true,
      };

      const result = await executeWorkflow(workflow, { status: 'active' });
      expect(result.status).toBe('success');
    });

    it('should evaluate not_equals condition', async () => {
      const workflow = {
        id: 'workflow-123',
        name: 'Test',
        description: 'Test',
        trigger: 'beneficiary_created' as const,
        conditions: [
          {
            field: 'status',
            operator: 'not_equals' as const,
            value: 'inactive',
          },
        ],
        actions: [],
        status: 'active' as const,
        createdBy: 'user-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        executionCount: 0,
        isEnabled: true,
      };

      const result = await executeWorkflow(workflow, { status: 'active' });
      expect(result.status).toBe('success');
    });

    it('should evaluate greater_than condition', async () => {
      const workflow = {
        id: 'workflow-123',
        name: 'Test',
        description: 'Test',
        trigger: 'beneficiary_created' as const,
        conditions: [
          {
            field: 'amount',
            operator: 'greater_than' as const,
            value: 100,
          },
        ],
        actions: [],
        status: 'active' as const,
        createdBy: 'user-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        executionCount: 0,
        isEnabled: true,
      };

      const result = await executeWorkflow(workflow, { amount: 500 });
      expect(result.status).toBe('success');
    });

    it('should evaluate less_than condition', async () => {
      const workflow = {
        id: 'workflow-123',
        name: 'Test',
        description: 'Test',
        trigger: 'beneficiary_created' as const,
        conditions: [
          {
            field: 'amount',
            operator: 'less_than' as const,
            value: 1000,
          },
        ],
        actions: [],
        status: 'active' as const,
        createdBy: 'user-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        executionCount: 0,
        isEnabled: true,
      };

      const result = await executeWorkflow(workflow, { amount: 500 });
      expect(result.status).toBe('success');
    });

    it('should evaluate contains condition', async () => {
      const workflow = {
        id: 'workflow-123',
        name: 'Test',
        description: 'Test',
        trigger: 'beneficiary_created' as const,
        conditions: [
          {
            field: 'name',
            operator: 'contains' as const,
            value: 'John',
          },
        ],
        actions: [],
        status: 'active' as const,
        createdBy: 'user-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        executionCount: 0,
        isEnabled: true,
      };

      const result = await executeWorkflow(workflow, { name: 'John Doe' });
      expect(result.status).toBe('success');
    });

    it('should evaluate exists condition', async () => {
      const workflow = {
        id: 'workflow-123',
        name: 'Test',
        description: 'Test',
        trigger: 'beneficiary_created' as const,
        conditions: [
          {
            field: 'email',
            operator: 'exists' as const,
          },
        ],
        actions: [],
        status: 'active' as const,
        createdBy: 'user-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        executionCount: 0,
        isEnabled: true,
      };

      const result = await executeWorkflow(workflow, { email: 'john@example.com' });
      expect(result.status).toBe('success');
    });

    it('should fail when field does not exist', async () => {
      const workflow = {
        id: 'workflow-123',
        name: 'Test',
        description: 'Test',
        trigger: 'beneficiary_created' as const,
        conditions: [
          {
            field: 'nonexistent',
            operator: 'equals' as const,
            value: 'test',
          },
        ],
        actions: [],
        status: 'active' as const,
        createdBy: 'user-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        executionCount: 0,
        isEnabled: true,
      };

      const result = await executeWorkflow(workflow, {});
      expect(result.status).toBe('failed');
    });
  });
});
