# Mernis (Turkish Identity) Integration Guide

## Overview

This guide explains how to use the Mernis integration service for verifying Turkish identity information. The service provides TC Kimlik No validation and optional verification against the Mernis database.

## Features

- ✅ TC Kimlik No format validation with checksum verification
- ✅ Identity verification (mock implementation for development)
- ✅ Batch verification support
- ✅ React hooks for easy integration
- ✅ UI components for quick implementation
- ✅ API endpoints for server-side verification
- ✅ Privacy masking for display purposes

## Quick Start

### 1. Using the Mernis Verification Button

The easiest way to add Mernis verification to your form:

```tsx
import { MernisVerificationButton } from '@/shared/components/ui/mernis-verification';

function BeneficiaryForm() {
  const [tcKimlikNo, setTcKimlikNo] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');

  const handleVerified = (result) => {
    console.log('Verified:', result);
    // Handle successful verification
  };

  return (
    <form>
      <input
        type="text"
        value={tcKimlikNo}
        onChange={(e) => setTcKimlikNo(e.target.value)}
        placeholder="TC Kimlik No"
      />
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ad"
      />
      <input
        type="text"
        value={surname}
        onChange={(e) => setSurname(e.target.value)}
        placeholder="Soyad"
      />

      <MernisVerificationButton
        tcKimlikNo={tcKimlikNo}
        name={name}
        surname={surname}
        onVerified={handleVerified}
      />
    </form>
  );
}
```

### 2. Using the React Hook

For more control, use the `useMernisVerification` hook:

```tsx
import { useMernisVerification } from '@/shared/hooks/useMernisVerification';

function MyComponent() {
  const { isVerifying, verificationResult, verifyIdentity } = useMernisVerification();

  const handleVerify = async () => {
    await verifyIdentity({
      tcKimlikNo: '12345678901',
      name: 'Ahmet',
      surname: 'Yılmaz',
      birthYear: 1990
    });
  };

  return (
    <div>
      <button onClick={handleVerify} disabled={isVerifying}>
        {isVerifying ? 'Verifying...' : 'Verify Identity'}
      </button>

      {verificationResult && (
        <div>
          <p>Valid: {verificationResult.isValid ? 'Yes' : 'No'}</p>
          <p>Verified: {verificationResult.isVerified ? 'Yes' : 'No'}</p>
          <p>Message: {verificationResult.message}</p>
        </div>
      )}
    </div>
  );
}
```

### 3. Using the Service Directly

For server-side or advanced usage:

```typescript
import { verifyWithMernis } from '@/shared/lib/services/mernis.service';

async function verifyIdentity() {
  const result = await verifyWithMernis({
    tcKimlikNo: '12345678901',
    name: 'Ahmet',
    surname: 'Yılmaz',
    birthYear: 1990
  });

  console.log(result.isVerified); // true or false
  console.log(result.message); // Verification message
}
```

### 4. API Route Usage

Call the API from client-side code:

```javascript
const response = await fetch('/api/mernis/verify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    tcKimlikNo: '12345678901',
    name: 'Ahmet',
    surname: 'Yılmaz',
    birthYear: 1990
  })
});

const data = await response.json();
console.log(data.success);
console.log(data.data);
```

## API Reference

### verifyWithMernis(request)

Verifies Turkish identity with Mernis.

**Parameters:**
```typescript
{
  tcKimlikNo: string;  // Required: TC Kimlik No
  name?: string;        // Optional: First name
  surname?: string;     // Optional: Last name
  birthYear?: number;   // Optional: Birth year
}
```

**Returns:**
```typescript
{
  isValid: boolean;         // Whether TC Kimlik format is valid
  isVerified: boolean;      // Whether identity was verified
  citizenName?: string;     // Name from Mernis (if verified)
  citizenSurname?: string;  // Surname from Mernis (if verified)
  citizenBirthYear?: number; // Birth year from Mernis (if verified)
  message: string;          // Status message
  error?: string;           // Error details (if any)
}
```

### verifyTcKimlikNoFormat(tcKimlikNo)

Validates TC Kimlik No format and checksum.

**Parameters:**
- `tcKimlikNo` (string): TC Kimlik number

**Returns:**
```typescript
{
  isValid: boolean;
  error?: string;  // Error message if invalid
}
```

### formatTcKimlikNo(tcKimlikNo)

Formats TC Kimlik No for display (adds spaces).

**Example:** `12345678901` → `123 456 789 01`

### maskTcKimlikNo(tcKimlikNo)

Masks TC Kimlik No for privacy (shows first 3 and last 4 digits).

**Example:** `12345678901` → `123****8901`

## Production Deployment

### Real Mernis API Integration

To use the production Mernis API:

1. **Obtain Credentials**: Contact the relevant Turkish government authority to get API credentials.

2. **Environment Variables**: Add to `.env.local`:
   ```env
   MERNIS_API_KEY=your_api_key
   MERNIS_IBAN=your_iban
   MERNIS_ENDPOINT=https://apiservice.gov.tr/mernis/verify
   ```

3. **Update Service**: Modify `mernis.service.ts` to use the real API endpoint (see commented code in the file).

4. **Security**: Implement proper authentication and rate limiting.

### Mock Data

The current implementation uses mock data for development. Test TC numbers:
- `12345678901` - Ahmet YILMAZ (1990)
- `98765432109` - Ayşe KAYA (1985)
- `11111111111` - Mehmet DEMIR (1975)

## Validation Rules

### TC Kimlik No Validation

1. **Format**: Must be exactly 11 digits
2. **First Digit**: Cannot be 0
3. **Checksum**: Must pass the official TC Kimlik No algorithm
4. **Blacklist**: Cannot be all same digits (11111111111, etc.)

### Verification Process

1. Validate TC Kimlik No format
2. Call Mernis API (or mock database)
3. Verify additional details if provided (name, surname, birth year)
4. Return result with citizen information

## Error Handling

### Common Error Messages

- `"Geçersiz TC Kimlik No formatı"` - Format validation failed
- `"Bu TC Kimlik No geçersizdir"` - Blacklisted number
- `"Kimlik doğrulanamadı"` - Not found in Mernis database
- `"Kimlik bilgileri eşleşmiyor"` - Name/surname/birth year mismatch
- `"Kimlik doğrulama hatası"` - System error

### Best Practices

1. Always validate format before calling verify
2. Display clear error messages to users
3. Log verification attempts for audit
4. Handle network timeouts gracefully
5. Don't store verified TC numbers unless necessary

## Security Considerations

### Data Protection

- TC Kimlik numbers are sensitive PII (Personally Identifiable Information)
- Mask numbers in logs and error messages
- Use HTTPS for all API calls
- Implement rate limiting to prevent abuse
- Log all verification attempts for audit trail

### Privacy

- Use `maskTcKimlikNo()` for display in UI
- Only show full number when necessary
- Implement data retention policies
- Comply with KVKK (Turkish Data Protection Law)

### Rate Limiting

Implement rate limiting on the API route:

```typescript
// Example rate limiting (already implemented in middleware)
const rateLimiter = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
};
```

## Testing

### Unit Tests

Tests are located in:
- `/src/__tests__/lib/sanitization.test.ts` - TC Kimlik validation tests

### Integration Tests

Example test:
```typescript
import { verifyWithMernis } from '@/shared/lib/services/mernis.service';

test('should verify valid TC Kimlik', async () => {
  const result = await verifyWithMernis({
    tcKimlikNo: '12345678901',
    name: 'AHMET',
    surname: 'YILMAZ',
    birthYear: 1990
  });

  expect(result.isValid).toBe(true);
  expect(result.isVerified).toBe(true);
});
```

## Troubleshooting

### Issue: "TC Kimlik No formatı geçersiz"

**Solution**: Ensure the number is exactly 11 digits and passes checksum validation.

### Issue: "Kimlik doğrulanamadı"

**Possible Causes**:
- TC Kimlik not in mock database (for development)
- Invalid credentials (for production)
- Network timeout
- API service unavailable

**Solution**: Check network connection, verify credentials, try again later.

### Issue: "Kimlik bilgileri eşleşmiyor"

**Solution**: Verify that name, surname, and birth year exactly match the Mernis records (case-insensitive for names).

## Support

For issues or questions:
1. Check this documentation
2. Review code comments in `mernis.service.ts`
3. Test with mock data first
4. Check API response for detailed error messages

## References

- [Turkish Identity Number Algorithm](https://en.wikipedia.org/wiki/Turkish_identity_number)
- [KVKK (Data Protection Law)](https://kvkk.gov.tr/)
- Mernis Official Documentation (Turkish Government)
