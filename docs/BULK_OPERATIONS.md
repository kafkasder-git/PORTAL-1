# Bulk Operations Guide

## Overview

This document outlines the comprehensive bulk operations system in the Dernek Yönetim Sistemi, enabling users to perform actions on multiple entities simultaneously for improved efficiency.

## Table of Contents

1. [System Overview](#system-overview)
2. [Supported Operations](#supported-operations)
3. [Bulk Operations Service](#bulk-operations-service)
4. [UI Components](#ui-components)
5. [API Endpoints](#api-endpoints)
6. [Entity Types](#entity-types)
7. [Use Cases](#use-cases)
8. [Best Practices](#best-practices)

---

## System Overview

The bulk operations system allows users to:

- Select multiple entities at once
- Perform batch operations (delete, update, export, etc.)
- Track operation progress in real-time
- Handle partial failures gracefully
- Export data in bulk
- Undo/redo operations (future feature)

### Architecture

```
UI Components (BulkActionsToolbar)
    ↓
BulkOperationsService
    ↓
API Routes (/api/bulk-operations)
    ↓
Database Operations
```

### Key Features

- **Real-time Progress**: Track operation status and progress
- **Error Handling**: Partial failures don't stop entire operation
- **Validation**: Pre-validate operations before execution
- **Throttling**: Rate-limited to prevent server overload
- **Cancellable**: Cancel running operations
- **Persistent**: Operation history maintained
- **Export**: Download results as CSV

---

## Supported Operations

### 1. Delete

Remove multiple entities from the system.

**Supported Entities**:
- Beneficiaries
- Donations
- Aid Applications
- Tasks
- Users
- Documents
- Meetings

**Example**:
```typescript
await bulkOperationsService.createOperation(
  'beneficiary',
  'delete',
  ['id1', 'id2', 'id3']
);
```

### 2. Update

Modify multiple entities with the same data.

**Supported Fields**:
- Status
- Tags
- Assigned User
- Priority
- Custom fields

**Example**:
```typescript
await bulkOperationsService.createOperation(
  'task',
  'update',
  ['task1', 'task2'],
  { priority: 'high', assignedTo: 'user123' }
);
```

### 3. Export

Export entities to CSV file.

**Supported Entities**:
- All entity types

**Example**:
```typescript
const operation = await bulkOperationsService.createOperation(
  'donation',
  'export',
  ['donation1', 'donation2']
);

// Download file when complete
if (operation.result?.downloadUrl) {
  window.open(operation.result.downloadUrl);
}
```

### 4. Archive

Mark entities as archived (soft delete).

**Supported Entities**:
- Beneficiaries
- Donations
- Aid Applications
- Tasks
- Documents
- Meetings

**Example**:
```typescript
await bulkOperationsService.createOperation(
  'aid-application',
  'archive',
  ['app1', 'app2']
);
```

### 5. Activate/Deactivate

Toggle active status of entities.

**Supported Entities**:
- Users
- Aid Applications

**Example**:
```typescript
await bulkOperationsService.createOperation(
  'user',
  'activate',
  ['user1', 'user2']
);
```

### 6. Assign

Assign entities to users.

**Supported Entities**:
- Beneficiaries
- Tasks

**Example**:
```typescript
await bulkOperationsService.createOperation(
  'task',
  'assign',
  ['task1', 'task2'],
  { assigneeId: 'user123' }
);
```

### 7. Tag

Add or update tags on entities.

**Supported Entities**:
- Beneficiaries
- Tasks

**Example**:
```typescript
await bulkOperationsService.createOperation(
  'beneficiary',
  'tag',
  ['ben1', 'ben2'],
  { tags: ['urgent', 'priority'] }
);
```

---

## Bulk Operations Service

The `BulkOperationsService` class manages all bulk operations.

### Usage

```typescript
import { bulkOperationsService } from '@/shared/lib/services/bulk-operations.service';

// Create operation
const operation = await bulkOperationsService.createOperation(
  entityType,
  action,
  entityIds,
  data
);

// Subscribe to updates
const unsubscribe = bulkOperationsService.subscribe((op) => {
  console.log(`Operation ${op.id} progress: ${op.progress}%`);
  if (op.status === 'completed') {
    console.log('Operation completed!');
  }
});

// Cancel operation
bulkOperationsService.cancelOperation(operation.id);
```

### Methods

#### Core Methods

- `createOperation(entityType, action, entityIds, data?)`: Create and execute operation
- `getOperation(id)`: Get operation by ID
- `getAllOperations()`: Get all operations
- `cancelOperation(id)`: Cancel running operation
- `subscribe(callback)`: Subscribe to operation updates
- `validateOperation(entityType, action, entityIds)`: Validate operation before execution

#### Operation Lifecycle

```
pending → running → completed
              ↓
            failed
              ↓
          cancelled
```

### Operation Object

```typescript
interface BulkOperation {
  id: string;
  entityType: EntityType;
  action: BulkAction;
  entityIds: string[];
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;        // 0-100
  total: number;           // Total entities
  processed: number;       // Processed entities
  succeeded: number;       // Successful operations
  failed: number;          // Failed operations
  errors: BulkOperationError[];
  startedAt?: string;
  completedAt?: string;
  result?: any;            // Export URLs, etc.
}
```

---

## UI Components

### BulkActionsToolbar

Displays selected items and available actions.

```tsx
<BulkActionsToolbar
  entityType="beneficiary"
  selectedIds={selectedIds}
  totalCount={totalCount}
  onOperationComplete={() => {
    // Refresh data
    refetch();
  }}
  onCancel={() => {
    // Clear selection
    setSelectedIds([]);
  }}
/>
```

### Features

- Shows selection count
- Quick action buttons
- More actions dropdown
- Select all/none functionality
- Progress indication
- Cancel button

### Props

```typescript
interface BulkActionsToolbarProps {
  entityType: EntityType;
  selectedIds: string[];
  totalCount: number;
  onOperationComplete?: () => void;
  onCancel?: () => void;
}
```

### BulkSelectAll

Checkbox component for selecting all items.

```tsx
<BulkSelectAll
  checked={allSelected}
  indeterminate={someSelected}
  onChange={(checked) => {
    if (checked) {
      selectAll();
    } else {
      clearSelection();
    }
  }}
  totalCount={items.length}
  selectedCount={selectedIds.length}
/>
```

---

## API Endpoints

### Create Operation

```
POST /api/bulk-operations
```

**Request Body**:
```typescript
{
  entityType: 'beneficiary' | 'donation' | ...;
  action: 'delete' | 'update' | 'export' | ...;
  entityIds: string[];
  data?: Record<string, any>;  // For update, assign, tag operations
}
```

**Response**:
```typescript
{
  success: true;
  data: BulkOperation;
  message: string;
}
```

### Get Operation Status

```
GET /api/bulk-operations/{id}
```

**Response**:
```typescript
{
  success: true;
  data: BulkOperation;
}
```

### Cancel Operation

```
DELETE /api/bulk-operations/{id}
```

**Response**:
```typescript
{
  success: true;
  message: string;
}
```

---

## Entity Types

### Beneficiary

**Supported Operations**:
- Delete
- Update
- Export
- Archive
- Assign
- Tag

**Updateable Fields**:
- Status
- Tags
- Assigned User
- Priority
- Notes

### Donation

**Supported Operations**:
- Delete
- Update
- Export
- Archive

**Updateable Fields**:
- Status
- Notes
- Category

### Aid Application

**Supported Operations**:
- Delete
- Update
- Export
- Archive
- Activate
- Deactivate

**Updateable Fields**:
- Status
- Stage
- Assigned Reviewer

### Task

**Supported Operations**:
- Delete
- Update
- Export
- Archive
- Assign

**Updateable Fields**:
- Status
- Priority
- Assigned User
- Due Date

### User

**Supported Operations**:
- Delete
- Update
- Export
- Activate
- Deactivate

**Updateable Fields**:
- Role
- Status
- Permissions

### Document

**Supported Operations**:
- Delete
- Update
- Export
- Archive

**Updateable Fields**:
- Category
- Tags

### Meeting

**Supported Operations**:
- Delete
- Update
- Export
- Archive

**Updateable Fields**:
- Status
- Location

---

## Use Cases

### Use Case 1: Bulk Archive Old Beneficiaries

```tsx
// Select beneficiaries to archive
const selectedIds = beneficiaries
  .filter(b => b.status === 'completed')
  .map(b => b.id);

// Create archive operation
await bulkOperationsService.createOperation(
  'beneficiary',
  'archive',
  selectedIds
);
```

### Use Case 2: Export Monthly Donations

```tsx
// Filter donations by date
const monthlyDonations = donations.filter(d => {
  const donationDate = new Date(d.createdAt);
  const monthStart = new Date();
  monthStart.setDate(1);
  return donationDate >= monthStart;
});

// Export
const operation = await bulkOperationsService.createOperation(
  'donation',
  'export',
  monthlyDonations.map(d => d.id)
);

// Download when ready
operation.subscribe(op => {
  if (op.status === 'completed' && op.result?.downloadUrl) {
    window.open(op.result.downloadUrl);
  }
});
```

### Use Case 3: Assign Tasks to Team Member

```tsx
// Select unassigned tasks
const unassignedTasks = tasks.filter(t => !t.assignedTo);

// Assign to user
await bulkOperationsService.createOperation(
  'task',
  'assign',
  unassignedTasks.map(t => t.id),
  { assigneeId: 'user123' }
);
```

### Use Case 4: Update Task Priorities

```tsx
// Select high-priority overdue tasks
const overdueHighPriority = tasks.filter(t => {
  const isOverdue = new Date(t.dueDate) < new Date();
  const isHighPriority = t.priority === 'high';
  return isOverdue && isHighPriority;
});

// Update to urgent
await bulkOperationsService.createOperation(
  'task',
  'update',
  overdueHighPriority.map(t => t.id),
  { priority: 'urgent' }
);
```

### Use Case 5: Bulk Export with Progress Tracking

```tsx
const [operation, setOperation] = useState<BulkOperation | null>(null);
const [progress, setProgress] = useState(0);

const handleBulkExport = async () => {
  const op = await bulkOperationsService.createOperation(
    'aid-application',
    'export',
    selectedIds
  );

  setOperation(op);

  const unsubscribe = bulkOperationsService.subscribe((updatedOp) => {
    if (updatedOp.id === op.id) {
      setProgress(updatedOp.progress);

      if (updatedOp.status === 'completed') {
        setProgress(100);
        // Download file
        if (updatedOp.result?.downloadUrl) {
          window.open(updatedOp.result.downloadUrl);
        }
        unsubscribe();
      }
    }
  });
};
```

---

## Best Practices

### 1. Selection

✅ **DO**: Provide clear selection controls
```tsx
<div className="flex items-center gap-2">
  <Checkbox
    checked={selectedIds.length === items.length}
    onCheckedChange={handleSelectAll}
  />
  <span>{selectedIds.length} seçili</span>
</div>
```

❌ **DON'T**: Allow unlimited selections
```tsx
// Set reasonable limits
const MAX_SELECTION = 1000;
if (selectedIds.length > MAX_SELECTION) {
  toast.error(`Maksimum ${MAX_SELECTION} öğe seçebilirsiniz`);
}
```

### 2. Validation

✅ **DO**: Validate before execution
```typescript
const validation = bulkOperationsService.validateOperation(
  entityType,
  action,
  entityIds
);

if (!validation.valid) {
  toast.error(validation.errors.join(', '));
  return;
}
```

### 3. Error Handling

✅ **DO**: Handle partial failures gracefully
```typescript
operation.subscribe(op => {
  if (op.status === 'completed') {
    if (op.failed > 0) {
      toast.warning(`${op.succeeded} başarılı, ${op.failed} başarısız`);
    } else {
      toast.success(`${op.succeeded} öğe başarıyla işlendi`);
    }
  } else if (op.status === 'failed') {
    toast.error('Toplu işlem başarısız oldu');
  }
});
```

❌ **DON'T**: Ignore failures
```typescript
// Bad - no error handling
await bulkOperationsService.createOperation(...);
```

### 4. Performance

✅ **DO**: Use reasonable batch sizes
```typescript
// Process in batches of 100
const BATCH_SIZE = 100;
for (let i = 0; i < selectedIds.length; i += BATCH_SIZE) {
  const batch = selectedIds.slice(i, i + BATCH_SIZE);
  await bulkOperationsService.createOperation(..., batch);
}
```

✅ **DO**: Show progress to users
```typescript
<BulkActionsToolbar
  selectedIds={selectedIds}
  onOperationComplete={() => refetch()}
/>
```

### 5. User Feedback

✅ **DO**: Provide clear feedback
```typescript
toast.success(`Toplu işlem başlatıldı: ${selectedIds.length} öğe`);
```

✅ **DO**: Show operation history
```typescript
const operations = bulkOperationsService.getAllOperations();
```

### 6. Confirmation

✅ **DO**: Confirm destructive operations
```typescript
if (action === 'delete' || action === 'archive') {
  const confirmed = window.confirm(
    `${selectedIds.length} öğe silinecek. Emin misiniz?`
  );
  if (!confirmed) return;
}
```

### 7. Accessibility

✅ **DO**: Use proper ARIA labels
```tsx
<Button
  aria-label={`Delete ${selectedIds.length} items`}
  onClick={handleDelete}
>
  <Trash2 className="h-4 w-4" />
</Button>
```

### 8. Testing

```typescript
// Test bulk operations
test('bulk delete operation', async () => {
  const operation = await bulkOperationsService.createOperation(
    'task',
    'delete',
    ['task1', 'task2']
  );

  expect(operation.status).toBe('running');
  expect(operation.total).toBe(2);
});
```

---

## Error Messages

### Common Errors

| Error Code | Message | Solution |
|------------|---------|----------|
| INVALID_ENTITY_TYPE | Geçersiz varlık türü | Check entityType parameter |
| INVALID_ACTION | Geçersiz işlem | Check action parameter |
| NO_ENTITIES_SELECTED | Hiç öğe seçilmedi | Select at least one entity |
| MAX_LIMIT_EXCEEDED | Maksimum limit aşıldı | Reduce selection size |
| PERMISSION_DENIED | Yetki yok | Check user permissions |
| OPERATION_IN_PROGRESS | İşlem devam ediyor | Wait for current operation |
| INVALID_DATA | Geçersiz veri | Check data parameter |

---

## Performance Considerations

### 1. Operation Limits

- **Maximum entities per operation**: 1000
- **Recommended batch size**: 100-200
- **Operation timeout**: 30 minutes

### 2. Throttling

Operations are automatically throttled to prevent server overload:
- 50ms delay between entity operations
- Automatic retry on failure (3 attempts)
- Circuit breaker pattern (future)

### 3. Concurrency

- Maximum concurrent operations per user: 3
- Queue excess operations
- Priority queue for important operations

### 4. Cleanup

Completed operations are automatically cleaned up after 7 days:
```typescript
// Automatic cleanup runs every 24 hours
setInterval(() => {
  bulkOperationsService.cleanupCompletedOperations();
}, 24 * 60 * 60 * 1000);
```

---

## Future Enhancements

### Planned Features

1. **Undo/Redo**: Revert bulk operations
2. **Scheduling**: Schedule operations for later
3. **Conditional Operations**: IF/THEN logic
4. **Operation Templates**: Save and reuse operations
5. **Advanced Filtering**: Filter before selecting
6. **Bulk Import**: Import data in bulk
7. **Email Notifications**: Notify when operations complete

---

## Troubleshooting

### Issue: Operation Never Completes

**Possible Causes**:
- Server timeout
- Too many entities
- Network issues

**Solution**:
```typescript
// Check operation status
const operation = bulkOperationsService.getOperation(operationId);
if (operation.status === 'running') {
  // Cancel and retry with smaller batch
  bulkOperationsService.cancelOperation(operationId);
}
```

### Issue: Partial Failures

**Possible Causes**:
- Invalid data on some entities
- Permission issues
- Locked records

**Solution**:
```typescript
// Check errors
operation.errors.forEach(error => {
  console.error(`Failed to process ${error.entityId}: ${error.message}`);
});
```

### Issue: Permission Denied

**Solution**:
```typescript
// Check user permissions
if (!user.permissions.includes(`${entityType}:bulk-${action}`)) {
  throw new Error('Bu işlem için yetkiniz yok');
}
```

---

## Resources

### Documentation
- [React Bulk Operations](https://example.com)
- [CSV Export Guide](https://example.com)

### Articles
- [Batch Processing Best Practices](https://example.com)
- [Database Optimization](https://example.com)

---

*Last Updated: November 2025*
*Version: 1.0*
