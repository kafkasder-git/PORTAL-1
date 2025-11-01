/**
 * Bulk Operations Service
 * Handles batch operations on multiple entities
 */

export type BulkAction =
  | 'delete'
  | 'update'
  | 'export'
  | 'archive'
  | 'activate'
  | 'deactivate'
  | 'assign'
  | 'tag';

export type EntityType =
  | 'user'
  | 'beneficiary'
  | 'donation'
  | 'aid-application'
  | 'meeting'
  | 'task'
  | 'document';

export interface BulkOperation {
  id: string;
  entityType: EntityType;
  action: BulkAction;
  entityIds: string[];
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  errors: BulkOperationError[];
  startedAt?: string;
  completedAt?: string;
  result?: any;
}

export interface BulkOperationError {
  entityId: string;
  message: string;
  code?: string;
}

export interface BulkUpdateData {
  [key: string]: any;
}

export class BulkOperationsService {
  private operations: Map<string, BulkOperation> = new Map();
  private subscribers: Set<(operation: BulkOperation) => void> = new Set();

  /**
   * Create a new bulk operation
   */
  async createOperation(
    entityType: EntityType,
    action: BulkAction,
    entityIds: string[],
    data?: BulkUpdateData
  ): Promise<BulkOperation> {
    // Validate operation before creating
    const validation = this.validateOperation(entityType, action, entityIds);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    const operation: BulkOperation = {
      id: crypto.randomUUID(),
      entityType,
      action,
      entityIds,
      status: 'pending',
      progress: 0,
      total: entityIds.length,
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: [],
    };

    this.operations.set(operation.id, operation);
    this.notify(operation);

    // Execute operation
    this.executeOperation(operation, data);

    return operation;
  }

  /**
   * Execute bulk operation
   */
  private async executeOperation(operation: BulkOperation, data?: BulkUpdateData): Promise<void> {
    operation.status = 'running';
    operation.startedAt = new Date().toISOString();
    this.notify(operation);

    try {
      switch (operation.action) {
        case 'delete':
          await this.bulkDelete(operation);
          break;
        case 'update':
          await this.bulkUpdate(operation, data!);
          break;
        case 'export':
          await this.bulkExport(operation);
          break;
        case 'archive':
          await this.bulkArchive(operation);
          break;
        case 'activate':
          await this.bulkActivate(operation);
          break;
        case 'deactivate':
          await this.bulkDeactivate(operation);
          break;
        case 'assign':
          await this.bulkAssign(operation, data!);
          break;
        case 'tag':
          await this.bulkTag(operation, data!);
          break;
        default:
          throw new Error(`Unknown action: ${operation.action}`);
      }

      operation.status = 'completed';
      operation.completedAt = new Date().toISOString();
      operation.progress = 100;
    } catch (error: any) {
      operation.status = 'failed';
      operation.completedAt = new Date().toISOString();
      operation.errors.push({
        entityId: 'system',
        message: error.message,
        code: error.code,
      });
    }

    this.notify(operation);
  }

  /**
   * Bulk delete operation
   */
  private async bulkDelete(operation: BulkOperation): Promise<void> {
    for (const entityId of operation.entityIds) {
      try {
        await this.deleteEntity(operation.entityType, entityId);
        operation.succeeded++;
        operation.processed++;
        operation.progress = (operation.processed / operation.total) * 100;
        this.notify(operation);
      } catch (error: any) {
        operation.failed++;
        operation.errors.push({
          entityId,
          message: error.message,
          code: error.code,
        });
        operation.processed++;
        operation.progress = (operation.processed / operation.total) * 100;
        this.notify(operation);
      }

      // Small delay to prevent overwhelming the server
      await this.delay(50);
    }
  }

  /**
   * Bulk update operation
   */
  private async bulkUpdate(operation: BulkOperation, data: BulkUpdateData): Promise<void> {
    for (const entityId of operation.entityIds) {
      try {
        await this.updateEntity(operation.entityType, entityId, data);
        operation.succeeded++;
        operation.processed++;
        operation.progress = (operation.processed / operation.total) * 100;
        this.notify(operation);
      } catch (error: any) {
        operation.failed++;
        operation.errors.push({
          entityId,
          message: error.message,
          code: error.code,
        });
        operation.processed++;
        operation.progress = (operation.processed / operation.total) * 100;
        this.notify(operation);
      }

      await this.delay(50);
    }
  }

  /**
   * Bulk export operation
   */
  private async bulkExport(operation: BulkOperation): Promise<void> {
    const entities = [];

    for (const entityId of operation.entityIds) {
      try {
        const entity = await this.getEntity(operation.entityType, entityId);
        entities.push(entity);
        operation.succeeded++;
        operation.processed++;
        operation.progress = (operation.processed / operation.total) * 100;
        this.notify(operation);
      } catch (error: any) {
        operation.failed++;
        operation.errors.push({
          entityId,
          message: error.message,
          code: error.code,
        });
        operation.processed++;
        operation.progress = (operation.processed / operation.total) * 100;
        this.notify(operation);
      }

      await this.delay(50);
    }

    // Generate export file
    const exportData = this.generateExportFile(entities, operation.entityType);
    operation.result = { downloadUrl: exportData.url };
  }

  /**
   * Bulk archive operation
   */
  private async bulkArchive(operation: BulkOperation): Promise<void> {
    await this.bulkUpdate(operation, { status: 'archived' });
  }

  /**
   * Bulk activate operation
   */
  private async bulkActivate(operation: BulkOperation): Promise<void> {
    await this.bulkUpdate(operation, { isActive: true });
  }

  /**
   * Bulk deactivate operation
   */
  private async bulkDeactivate(operation: BulkOperation): Promise<void> {
    await this.bulkUpdate(operation, { isActive: false });
  }

  /**
   * Bulk assign operation
   */
  private async bulkAssign(operation: BulkOperation, data: BulkUpdateData): Promise<void> {
    if (!data.assigneeId) {
      throw new Error('Assignee ID is required');
    }

    await this.bulkUpdate(operation, { assignedTo: data.assigneeId });
  }

  /**
   * Bulk tag operation
   */
  private async bulkTag(operation: BulkOperation, data: BulkUpdateData): Promise<void> {
    if (!data.tags) {
      throw new Error('Tags are required');
    }

    await this.bulkUpdate(operation, { tags: data.tags });
  }

  /**
   * Delete single entity
   */
  private async deleteEntity(entityType: EntityType, entityId: string): Promise<void> {
    const endpoint = this.getEndpoint(entityType);
    const response = await fetch(`${endpoint}/${entityId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete ${entityType}: ${response.statusText}`);
    }
  }

  /**
   * Update single entity
   */
  private async updateEntity(
    entityType: EntityType,
    entityId: string,
    data: BulkUpdateData
  ): Promise<void> {
    const endpoint = this.getEndpoint(entityType);
    const response = await fetch(`${endpoint}/${entityId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update ${entityType}: ${response.statusText}`);
    }
  }

  /**
   * Get single entity
   */
  private async getEntity(entityType: EntityType, entityId: string): Promise<any> {
    const endpoint = this.getEndpoint(entityType);
    const response = await fetch(`${endpoint}/${entityId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch ${entityType}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get API endpoint for entity type
   */
  private getEndpoint(entityType: EntityType): string {
    const endpoints: Record<EntityType, string> = {
      user: '/api/users',
      beneficiary: '/api/beneficiaries',
      donation: '/api/donations',
      'aid-application': '/api/aid-applications',
      meeting: '/api/meetings',
      task: '/api/tasks',
      document: '/api/documents',
    };

    return endpoints[entityType];
  }

  /**
   * Generate export file
   */
  private generateExportFile(entities: any[], entityType: EntityType): { url: string; filename: string } {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${entityType}s-export-${timestamp}.csv`;

    // Convert to CSV
    const csvHeader = Object.keys(entities[0] || {}).join(',');
    const csvRows = entities.map(entity =>
      Object.values(entity)
        .map(value => `"${String(value).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csv = [csvHeader, ...csvRows].join('\n');

    // Create blob and URL
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    return { url, filename };
  }

  /**
   * Cancel operation
   */
  cancelOperation(operationId: string): void {
    const operation = this.operations.get(operationId);
    if (operation && operation.status === 'running') {
      operation.status = 'cancelled';
      operation.completedAt = new Date().toISOString();
      this.notify(operation);
    }
  }

  /**
   * Get operation by ID
   */
  getOperation(operationId: string): BulkOperation | undefined {
    return this.operations.get(operationId);
  }

  /**
   * Get all operations
   */
  getAllOperations(): BulkOperation[] {
    return Array.from(this.operations.values()).sort(
      (a, b) => new Date(b.startedAt || 0).getTime() - new Date(a.startedAt || 0).getTime()
    );
  }

  /**
   * Get operations by status
   */
  getOperationsByStatus(status: BulkOperation['status']): BulkOperation[] {
    return this.getAllOperations().filter(op => op.status === status);
  }

  /**
   * Subscribe to operation updates
   */
  subscribe(callback: (operation: BulkOperation) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  /**
   * Notify all subscribers
   */
  private notify(operation: BulkOperation): void {
    this.subscribers.forEach(callback => callback(operation));
  }

  /**
   * Utility: Delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate bulk operation
   */
  validateOperation(entityType: EntityType, action: BulkAction, entityIds: string[]): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check entity IDs
    if (!entityIds || entityIds.length === 0) {
      errors.push('At least one entity must be selected');
    }

    if (entityIds.length > 1000) {
      errors.push('Maximum 1000 entities can be processed at once');
    }

    // Validate action for entity type
    const validActions: Record<EntityType, BulkAction[]> = {
      user: ['delete', 'update', 'export', 'activate', 'deactivate'],
      beneficiary: ['delete', 'update', 'export', 'archive', 'assign', 'tag'],
      donation: ['delete', 'update', 'export', 'archive'],
      'aid-application': ['delete', 'update', 'export', 'archive', 'activate', 'deactivate'],
      meeting: ['delete', 'update', 'export', 'archive'],
      task: ['delete', 'update', 'export', 'archive', 'assign'],
      document: ['delete', 'update', 'export', 'archive'],
    };

    if (!validActions[entityType]?.includes(action)) {
      errors.push(`Action '${action}' is not valid for '${entityType}'`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Cleanup completed operations (older than 7 days)
   */
  cleanupCompletedOperations(): void {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    for (const [id, operation] of this.operations.entries()) {
      if (
        operation.status === 'completed' ||
        operation.status === 'failed' ||
        operation.status === 'cancelled'
      ) {
        const completedAt = new Date(operation.completedAt || 0);
        if (completedAt < sevenDaysAgo) {
          this.operations.delete(id);
        }
      }
    }
  }
}

export const bulkOperationsService = new BulkOperationsService();

// Cleanup old operations periodically
setInterval(() => {
  bulkOperationsService.cleanupCompletedOperations();
}, 24 * 60 * 60 * 1000); // Every 24 hours
