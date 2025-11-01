# Automated Workflow Engine Documentation

## Overview

The Automated Workflow Engine is a powerful system for creating, managing, and executing automated business processes within the Dernek Yönetim Sistemi (Association Management System). It allows administrators to set up triggers, conditions, and actions that automatically execute when specific events occur.

## Features

### Core Capabilities

- **Visual Workflow Builder**: Drag-and-drop interface for creating complex workflows
- **Event Triggers**: Automatically execute workflows based on system events
- **Conditional Logic**: Apply filters and conditions to workflow execution
- **Multiple Actions**: Support for various action types (notifications, emails, tasks, etc.)
- **Built-in Templates**: Pre-configured workflows for common scenarios
- **Test Mode**: Execute workflows manually for testing and debugging
- **Execution Tracking**: Monitor workflow performance and success rates

## Workflow Structure

### Components

1. **Triggers**: Events that start the workflow
2. **Conditions**: Filters that determine if the workflow should execute
3. **Actions**: Tasks that are performed when the workflow runs
4. **Status**: Current state of the workflow (active, inactive, draft, testing)

### Workflow Types

#### Triggers

| Trigger Type | Turkish Label | Description |
|--------------|---------------|-------------|
| `beneficiary_created` | İhtiyaç Sahibi Oluşturuldu | When a new beneficiary is registered |
| `donation_received` | Bağış Alındı | When a donation is received |
| `aid_application_submitted` | Yardım Başvurusu | When an aid application is submitted |
| `task_assigned` | Görev Atandı | When a task is assigned to a user |
| `meeting_scheduled` | Toplantı Planlandı | When a meeting is scheduled |
| `deadline_approaching` | Son Gün Yaklaşıyor | When a deadline is approaching |
| `custom` | Özel | Custom trigger type |

#### Actions

| Action Type | Turkish Label | Parameters |
|-------------|---------------|------------|
| `send_notification` | Bildirim Gönder | userId, type, title, message |
| `create_task` | Görev Oluştur | title, description, assignedTo, priority |
| `assign_user` | Kullanıcı Ata | entityType, entityId, userId, role |
| `update_status` | Durum Güncelle | entityType, entityId, status |
| `send_email` | E-posta Gönder | to, subject, template, data |
| `send_sms` | SMS Gönder | to, message |
| `generate_report` | Rapor Oluştur | type, format, filters |
| `move_to_stage` | Aşama Değiştir | applicationId, stage |

#### Condition Operators

| Operator | Turkish Label | Description |
|----------|---------------|-------------|
| `equals` | Eşittir | Value equals the condition |
| `not_equals` | Eşit Değildir | Value does not equal the condition |
| `greater_than` | Büyüktür | Value is greater than the condition |
| `less_than` | Küçüktür | Value is less than the condition |
| `contains` | İçerir | Value contains the condition |
| `exists` | Mevcut | Field exists (no value needed) |

## Built-in Templates

### 1. Yeni İhtiyaç Sahibi Karşılama (Beneficiary Welcome)

**Trigger**: `beneficiary_created`

**Actions**:
- Create a task to schedule a follow-up meeting
- Send a notification to administrators

**Use Case**: Automatically create follow-up tasks and notifications when a new beneficiary registers.

### 2. Bağış Makbuzu (Donation Receipt)

**Trigger**: `donation_received`

**Actions**:
- Send a thank you email to the donor
- Create a tracking task

**Use Case**: Automatically send receipts and track donations.

### 3. Görev Son Gün Hatırlatması (Task Deadline Reminder)

**Trigger**: `deadline_approaching`

**Actions**:
- Send notification to task assignee
- Send email reminder

**Use Case**: Prevent tasks from being forgotten by sending reminders before deadlines.

### 4. Yardım Başvurusu Değerlendirme (Aid Application Review)

**Trigger**: `aid_application_submitted`

**Actions**:
- Create review task
- Move application to review stage
- Send notification to reviewers

**Use Case**: Automatically initiate the review process for new aid applications.

## API Endpoints

### List Workflows
```
GET /api/workflows
```
Returns a list of all workflows.

### Create Workflow
```
POST /api/workflows
```
Creates a new workflow.

**Request Body**:
```typescript
{
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  conditions: WorkflowCondition[];
  actions: WorkflowActionConfig[];
}
```

### Get Workflow
```
GET /api/workflows/[id]
```
Retrieves a specific workflow by ID.

### Update Workflow
```
PUT /api/workflows/[id]
```
Updates an existing workflow.

### Delete Workflow
```
DELETE /api/workflows/[id]
```
Deletes a workflow.

### Execute Workflow
```
POST /api/workflows/[id]/execute
```
Executes a workflow for testing purposes.

## Usage Examples

### Creating a New Workflow

1. Navigate to the Workflow Management page
2. Click "Yeni İş Akışı" (New Workflow)
3. Choose a template or start from scratch
4. Configure the basic information (name, description, trigger)
5. Add conditions (optional)
6. Add actions (required)
7. Save the workflow

### Testing a Workflow

1. Find the workflow in the list
2. Click the "Test" (Test) button
3. The workflow will execute with test data
4. Check the result in the notification

### Managing Workflow Status

- **Aktif (Active)**: Workflow is enabled and will execute
- **Pasif (Inactive)**: Workflow is disabled and will not execute
- **Taslak (Draft)**: Workflow is being configured
- **Test (Testing)**: Workflow is in test mode

## Technical Implementation

### Service Layer (`workflow.service.ts`)

The core workflow engine provides:
- CRUD operations for workflows
- Workflow execution logic
- Condition evaluation
- Action execution
- Built-in templates

### API Routes (`/api/workflows/`)

RESTful endpoints for:
- Workflow management
- CRUD operations
- Execution triggers

### Frontend Components

- **WorkflowBuilder**: Visual workflow builder interface
- **WorkflowsPage**: Workflow management dashboard
- **Dialogs**: Create/edit workflow dialogs

### Execution Flow

1. **Trigger Event**: System event occurs
2. **Load Workflows**: Find workflows matching the trigger
3. **Evaluate Conditions**: Check if conditions are met
4. **Execute Actions**: Perform actions in sequence
5. **Log Result**: Record execution in database
6. **Send Notifications**: Notify relevant users

## Integration Points

### Appwrite Integration

The workflow engine integrates with Appwrite for:
- Task creation and management
- Meeting scheduling and updates
- Notification storage

### Email Service Integration

Prepared for integration with:
- SendGrid
- Mailgun
- Amazon SES

### SMS Service Integration

Prepared for integration with:
- Twilio
- Other SMS providers

## Best Practices

1. **Start with Templates**: Use built-in templates as a starting point
2. **Test Thoroughly**: Always test workflows before activating
3. **Use Conditions**: Apply conditions to prevent unnecessary executions
4. **Monitor Performance**: Check execution logs regularly
5. **Keep it Simple**: Start with simple workflows and add complexity gradually
6. **Document Workflows**: Add clear descriptions to all workflows

## Troubleshooting

### Common Issues

**Workflow Not Executing**
- Check if workflow status is "active"
- Verify trigger event is occurring
- Review condition logic
- Check execution logs

**Actions Not Working**
- Verify action parameters are correct
- Check integration status with external services
- Review action execution logs

**Conditions Failing**
- Check field names match actual data structure
- Verify operator selection
- Test with sample data

## Future Enhancements

Planned features:
- Workflow scheduling and automation
- Advanced analytics and reporting
- More action types
- Workflow templates marketplace
- Visual execution flow diagram
- Bulk workflow operations
- Workflow versioning
- A/B testing for workflows

## Support

For questions or issues:
1. Check the troubleshooting section
2. Review API documentation
3. Contact system administrator

---

*Last Updated: November 2025*
