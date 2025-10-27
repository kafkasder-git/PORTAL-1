<!-- 09dc9e46-2b70-4aeb-8537-f2bf03006a34 6b72c171-4ed3-47e6-b5df-94df0793e919 -->
# Messaging System Module Implementation

## Overview
Build a complete Messaging System with three message types (SMS, Email, Internal), template management, bulk messaging with recipient selection, progress tracking, and dynamic dashboard statistics integration.

## Implementation Steps

### 1. API Layer - Add Messages Endpoints

**File: `src/lib/api/appwrite-api.ts`**

Add `messagesApi` object with comprehensive methods:

**Core CRUD**:
- `getMessages(params?: QueryParams)` - List with filters (message_type, status, sender, is_bulk), search by subject/content, order by `$createdAt` desc
- `getMessage(id: string)` - Single message by ID
- `createMessage(data)` - Create with `ID.unique()`, status defaults to 'draft'
- `updateMessage(id, data)` - Update message
- `deleteMessage(id)` - Delete message

**Specialized Methods**:
- `sendMessage(id: string)` - Send draft message, update status to 'sent', set sent_at timestamp
- `getMessagesByType(messageType)` - Filter by 'sms' | 'email' | 'internal'
- `getMessagesBySender(senderId)` - Get messages by sender user ID
- `getMessagesStatistics()` - Dashboard stats: total SMS, total emails, failed count, draft count
- `getInboxMessages(userId)` - Internal messages where userId in recipients array using `Query.contains('recipients', userId)` and `Query.equal('message_type', 'internal')`
- `markAsRead(id, userId)` - Mark internal message as read (placeholder for future read receipts)

All methods use `handleAppwriteError` wrapper, return `AppwriteResponse<T>`, reference `COLLECTIONS.MESSAGES` and `DATABASE_ID`. Add to main `appwriteApi` export. Import `MessageDocument` type.

### 2. Validation Schema

**File: `src/lib/validations/message.ts`** (NEW)

Create comprehensive Zod validation following `task.ts` pattern:

**Helper Validators**:
- `phoneNumberSchema` - Turkish phone (10 digits, starts with 5)
- `emailSchema` - z.string().email()
- `recipientSchema` - validates based on message_type

**Enums**:
- `messageTypeEnum = z.enum(['sms', 'email', 'internal'])`
- `statusEnum = z.enum(['draft', 'sent', 'failed'])`

**Main Schema** `messageSchema`:
- `message_type` (required, enum)
- `sender` (required, string - user ID, auto-filled)
- `recipients` (required, array of strings, min 1, max 100)
- `subject` (optional for SMS, required for Email/Internal, max 200)
- `content` (required, min 1, max 160 for SMS, max 5000 for Email/Internal)
- `status` (enum, default: 'draft')
- `is_bulk` (boolean, default: false, auto-set if recipients.length > 1)
- `template_id` (optional, string)
- `sent_at` (optional, date string)

**Custom Refinements**:
- SMS: max 160 chars, valid phone recipients
- Email: valid email recipients, subject required
- Internal: valid user ID recipients, subject required
- Auto-set is_bulk if recipients > 1
- Auto-set sent_at if status='sent'

**Template Schema** `messageTemplateSchema`:
- `name` (required, 3-100 chars)
- `message_type` (required, enum)
- `subject` (optional, max 200)
- `content` (required, max 5000)
- `variables` (optional, array - placeholders like {name}, {amount})

**Utility Functions**:
- `getMessageTypeLabel(type)` - Turkish labels
- `getStatusLabel(status)` - Turkish labels
- `getStatusColor(status)` - Color classes
- `validateRecipients(recipients, messageType)` - Format validation

Export types: `MessageFormData`, `MessageTemplateFormData`

### 3. Message Form Component

**File: `src/components/forms/MessageForm.tsx`** (NEW)

Follow `TaskForm.tsx` pattern with dynamic fields:

**Props**: `onSuccess`, `onCancel`, `initialData`, `messageId` (edit mode), `defaultMessageType`

**State**: Form with react-hook-form + zodResolver, selectedRecipients array, selectedTemplate, characterCount, useMutation for create/update/send, current user from authStore

**Dynamic Form Fields**:
1. Message Type (Select, required, disabled in edit) - SMS/E-posta/Kurum İçi
2. Template Selector (optional) - dropdown with save option
3. Recipients (Multi-select/Input) - dynamic based on type:
   - SMS: phone numbers (comma-separated or multi-select)
   - Email: email addresses (comma-separated or multi-select)
   - Internal: users multi-select with search
   - Show count, removable badges, max 100
4. Subject (Input, conditional) - hidden for SMS, required for Email/Internal
5. Content (Textarea) - SMS: 160 char limit + counter, Email: rich text/5000 chars, Internal: 6 rows/5000 chars
6. Variable Replacements (if template has variables)
7. Status Display (edit mode only) - badge, send button if draft

**Actions**:
- Save as Draft, Send, Cancel buttons
- Confirmation dialog for bulk messages
- Loading states

**Submission**:
1. Validate with Zod
2. Auto-set is_bulk, sent_at if sending
3. Call createMessage/updateMessage
4. If sending, call sendMessage(id)
5. Invalidate ['messages'] and ['dashboard-metrics'] queries
6. Toast notifications

**Preview Section** (collapsible) - show message as recipients see it

Use Card layout, icons from lucide-react (MessageSquare, Mail, Users, Send, Save)

### 4. Message Components Directory

**File: `src/components/messages/`** (NEW)

Create directory for message-related components

### 5. Message Template Selector Component

**File: `src/components/messages/MessageTemplateSelector.tsx`** (NEW)

**Props**: `messageType`, `onSelect`, `onSaveAsTemplate`

**Features**:
- Template list filtered by messageType
- Each shows: name, content preview, last used
- Edit/Delete buttons
- Save Template Dialog with name input, favorite checkbox

**Pre-defined Templates**:
- SMS: "Bağış Teşekkürü", "Yardım Onayı", "Toplantı Hatırlatması"
- Email: "Bağış Makbuzu", "Yıllık Rapor", "Etkinlik Daveti"
- Internal: "Görev Atama", "Onay Talebi", "Bilgilendirme"

**Variable Support**: Show available variables, input fields when selected

Use Dialog for save modal, consistent Portal Plus styling

### 6. Recipient Selector Component

**File: `src/components/messages/RecipientSelector.tsx`** (NEW)

**Props**: `messageType`, `selectedRecipients`, `onRecipientsChange`, `maxRecipients` (default: 100)

**Recipient Sources** (4 tabs):
1. **İhtiyaç Sahipleri**: Fetch beneficiaries, filter by phone/email, show name/contact/city
2. **Bağışçılar**: Fetch unique donors, filter by phone/email, show name/contact/last donation
3. **Kullanıcılar**: Fetch users (Internal only), show name/role/email
4. **Manuel Giriş**: Textarea for comma-separated contacts, validate format

**Features**:
- Search/filter by name, phone, email
- "Tümünü Seç/Kaldır" buttons
- Show count "25/100 alıcı seçildi"
- Selected recipients as removable badges
- Filters: city, donation type, role, date range

**Validation**: Check format, show errors, prevent exceeding max

Use Tabs, Checkbox components, Portal Plus styling

### 7. Internal Messaging Page

**File: `src/app/(dashboard)/mesaj/kurum-ici/page.tsx`**

Replace placeholder with full inbox interface:

**State**: `activeTab` (inbox/sent/drafts), `search`, `page`, `selectedMessage`, `showComposeModal`, limit=20

**Data Fetching**:
- Inbox: getInboxMessages(userId) filtered by message_type='internal'
- Sent: getMessagesBySender(userId) filtered by message_type='internal'
- Drafts: getMessages filtered by status='draft' and sender=userId

**Header**: Title, description, "Yeni Mesaj" button (opens MessageForm with defaultMessageType='internal')

**Stats Cards** (3): Gelen (blue), Gönderilen (green), Taslaklar (gray)

**Tabs** (3):
1. Gelen Kutusu - sender, subject, preview, timestamp, unread bold
2. Gönderilenler - recipients, subject, timestamp, status
3. Taslaklar - recipients, subject, modified, edit/delete

**Features**:
- Search: "Mesaj ara"
- Filters: date range, sender, status
- Message list with pagination
- Detail view modal with reply/forward/delete
- Bulk actions: mark read/unread, delete
- Compose modal with MessageForm

**Loading/Empty States**: Spinner, error card, empty messages

Use Card, Tabs components, consistent styling

### 8. Bulk Messaging Page

**File: `src/app/(dashboard)/mesaj/toplu/page.tsx`**

Replace placeholder with wizard-based bulk sender:

**State**: `messageType` (sms/email), `step` (compose/recipients/preview/sending), `selectedRecipients`, `messageData`, `sendingProgress`, `sendingResults`, `showHistoryModal`

**Header**: Title, description, type toggle (SMS/E-posta), "Gönderim Geçmişi" button

**Stats Cards** (4): SMS sent, Emails sent, Failed, This month

**Wizard Steps** (4 with progress indicator):

1. **Mesaj Oluştur**: MessageForm with template selector, char counter, rich text
2. **Alıcı Seçimi**: RecipientSelector, show count, badges, Geri/İleri buttons
3. **Önizleme**: Message preview, recipient list, cost estimate, confirmation checkbox, Geri/Gönder
4. **Gönderiliyor**: Progress bar, real-time status, success/failure counters, failed list with reasons, summary with retry/report download

**Sending Logic**:
- useMutation to createMessage (is_bulk=true)
- Call sendMessage to trigger sending
- Batch sending (50 at a time) for large lists
- Track progress, update UI
- Handle failures, allow retry

**History Modal**: Table with past bulk messages (date, type, subject, counts, status), pagination, filters

**Cost Estimation**: Calculate SMS cost, show "125 SMS × 0.15 TL = 18.75 TL"

**Validation**: Confirm before 50+ recipients, validate formats, check duplicates

Use Card, Dialog, Progress components, MessageForm, RecipientSelector

### 9. Dashboard Integration

**File: `src/app/(dashboard)/genel/page.tsx`**

**Add Query** (after pending tasks):
```typescript
useQuery(['messages-statistics'], () => appwriteApi.messages.getMessagesStatistics())
```

**Update SMS & E-posta Section** (lines 268-293):
- Replace "0" with dynamic counts: `{isLoading ? '...' : smsCount}`
- Replace "0" with `{isLoading ? '...' : emailCount}`
- Make cards clickable:
  - SMS: navigate to `/mesaj/toplu?type=sms`
  - Email: navigate to `/mesaj/toplu?type=email`
- Add hover styles: `cursor-pointer hover:shadow-lg transition`

**Optional Enhancements**:
- Third card for "Kurum İçi Mesajlar"
- Breakdown: "X gönderildi, Y başarısız"
- Trend indicators

Import useRouter, add click handlers

## Key Technical Decisions

- **Three Message Types**: SMS (160 char limit, phone), Email (HTML, email), Internal (user notifications, user IDs)
- **Template System**: Reusable templates with variable support ({name}, {amount})
- **Bulk Sending**: Batch processing (50 at a time), progress tracking, failure handling
- **Recipient Sources**: Beneficiaries, Donors, Users, Manual entry with format validation
- **Wizard UX**: 4-step process (Compose → Recipients → Preview → Send) for bulk messages
- **Inbox Interface**: Email-like tabs (Inbox/Sent/Drafts) for internal messaging
- **Real-time Statistics**: Dynamic dashboard counts replacing hardcoded values
- **Validation**: Message-type-specific validation (phone for SMS, email for Email, user ID for Internal)
- **Cost Estimation**: SMS cost calculation before sending
- **History Tracking**: Store all bulk sends with success/failure details

## Files Modified/Created

**Modified (3)**:
- `src/lib/api/appwrite-api.ts` - Add messagesApi
- `src/app/(dashboard)/mesaj/kurum-ici/page.tsx` - Internal messaging page
- `src/app/(dashboard)/mesaj/toplu/page.tsx` - Bulk messaging page
- `src/app/(dashboard)/genel/page.tsx` - Dashboard statistics

**Created (6)**:
- `src/lib/validations/message.ts` - Validation schema
- `src/components/forms/MessageForm.tsx` - Message form
- `src/components/messages/` - New directory
- `src/components/messages/MessageTemplateSelector.tsx` - Template selector
- `src/components/messages/RecipientSelector.tsx` - Recipient selector


### To-dos

- [ ] Add messagesApi to appwrite-api.ts with CRUD and statistics methods
- [ ] Create message.ts validation schema with Zod for SMS/Email/Internal
- [ ] Build MessageForm.tsx with dynamic fields based on message type
- [ ] Create MessageTemplateSelector.tsx component
- [ ] Create RecipientSelector.tsx with multiple sources
- [ ] Implement internal messaging page with inbox interface
- [ ] Implement bulk messaging page with wizard and progress tracking
- [ ] Update dashboard with dynamic SMS/Email statistics