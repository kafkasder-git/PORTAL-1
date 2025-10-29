cp .env.example .env.local
```

Then fill in the required values for your Appwrite instance.

### Invalid Appwrite endpoint

**Symptoms:**
- Cannot connect to Appwrite server
- Connectivity tests fail with "Invalid URL" errors
- Health endpoint shows endpoint validation errors

**Solution:**
Ensure the endpoint URL is properly formatted:
- Must start with `http://` or `https://`
- Must end with `/v1` (Appwrite API version)
- Example: `https://cloud.appwrite.io/v1`

Check your `.env.local` file:
```bash
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://your-appwrite-instance.com/v1
```

### Invalid project ID

**Symptoms:**
- 401 Unauthorized errors when accessing Appwrite
- 404 Not Found errors for project resources
- Database operations fail

**Solution:**
Verify the project ID in your Appwrite console:
1. Go to your Appwrite dashboard
2. Check the project ID in the project settings
3. Ensure it matches `NEXT_PUBLIC_APPWRITE_PROJECT_ID` in `.env.local`

Project IDs are typically 20-24 characters long and contain only alphanumeric characters.

### Missing API key

**Symptoms:**
- Server-side operations fail (database writes, file uploads)
- Authentication works but data operations don't
- API key validation warnings

**Solution:**
Generate an API key in Appwrite console:
1. Go to your project dashboard
2. Navigate to **Settings** → **API Keys**
3. Create a new API key with appropriate permissions
4. Copy the key to `APPWRITE_API_KEY` in `.env.local`

**Note:** Never commit API keys to version control. Use `.env.local` for local development.

## Connectivity Issues

### Cannot reach Appwrite endpoint

**Symptoms:**
- Timeout errors when connecting to Appwrite
- DNS resolution failures
- Network connectivity issues

**Diagnosis:**
Run the connectivity test to identify the specific issue:

```bash
npm run test:connectivity
```

**Solutions:**
1. **Check network connectivity**: Ensure your machine can reach the internet
2. **Check firewall settings**: Verify that outbound connections to the Appwrite endpoint are allowed
3. **Check DNS resolution**: Try pinging the Appwrite domain
4. **Verify endpoint URL**: Ensure the URL is correct and accessible

### Timeout errors

**Symptoms:**
- Operations take too long and eventually fail
- Connectivity tests show timeout messages

**Solutions:**
1. **Increase timeout settings**: Use the `--timeout` option in connectivity tests
2. **Check Appwrite server status**: Visit the Appwrite status page or your self-hosted instance
3. **Check network latency**: High latency can cause timeouts
4. **Retry with different settings**:

```bash
npm run test:connectivity -- --timeout 10000 --retry 5
```

### CORS errors

**Symptoms:**
- Browser console shows CORS-related errors
- Client-side operations fail with CORS policy violations

**Solutions:**
1. **Add domain to Appwrite console**:
   - Go to **Settings** → **Web App** in Appwrite console
   - Add your development domain (e.g., `http://localhost:3000`)
2. **Check CORS headers**: Ensure Appwrite is configured to allow your domain
3. **Use server-side operations**: For sensitive operations, use server-side API routes instead of client-side calls

## Mock Backend Issues

### Schema mismatch

**Symptoms:**
- Mock API returns data that doesn't match Appwrite schema
- Tests fail with schema validation errors
- Inconsistencies between development and production data

**Diagnosis:**
Run the mock API test to detect schema mismatches:

```bash
npm run test:mock-api
```

**Solution:**
Update mock data to match the Appwrite collection schemas:
1. Check the schema definitions in `src/lib/appwrite/config.ts`
2. Update mock data in `src/lib/api/mock-api.ts`
3. Ensure field names, types, and required fields match
4. Run tests again to verify

### Mock API not working

**Symptoms:**
- Application falls back to real Appwrite when it should use mock
- Mock endpoints return errors
- BACKEND_PROVIDER setting ignored

**Solutions:**
1. **Check BACKEND_PROVIDER setting**:
   ```bash
   BACKEND_PROVIDER=mock
   NEXT_PUBLIC_BACKEND_PROVIDER=mock
   ```
2. **Verify mock data initialization**: Ensure mock data is properly loaded
3. **Check API resolver**: Verify `src/lib/api/index.ts` correctly switches based on provider
4. **Restart development server**: Sometimes configuration changes require a restart

## SDK Usage Issues

### Client SDK used on server

**Symptoms:**
- SDK guard warnings: "Client SDK detected in server environment"
- Runtime errors when using client SDK in API routes
- Operations fail because client SDK lacks server permissions

**Solution:**
Use the server SDK in API routes and server-side code:

```typescript
// ❌ Wrong - Client SDK in API route
import { account } from '@/lib/appwrite/client';

// ✅ Correct - Server SDK in API route
import { account } from '@/lib/appwrite/server';
```

### Server SDK used in client

**Symptoms:**
- SDK guard warnings: "Server SDK detected in client environment"
- Build errors or runtime failures in browser
- Server-side secrets exposed to client

**Solution:**
Use the client SDK in components and client-side code:

```typescript
// ❌ Wrong - Server SDK in component
import { account } from '@/lib/appwrite/server';

// ✅ Correct - Client SDK in component
import { account } from '@/lib/appwrite/client';
```

**Note:** The SDK guard provides warnings in development but can be configured to throw errors in production.

## Health Check Issues

### Health endpoint returns errors

**Symptoms:**
- `/api/health` endpoint returns 500 or error status
- Application appears unhealthy
- Monitoring systems flag issues

**Diagnosis:**
Use the detailed health check to see specific issues:

```bash
npm run health:check
```

Or visit: `http://localhost:3000/api/health?detailed=true`

**Common issues:**
- **Validation errors**: Check environment variable validation
- **Connectivity failures**: Run connectivity tests separately
- **Configuration issues**: Use `npm run validate:config`

### Health endpoint timeout

**Symptoms:**
- Health check requests hang or timeout
- Cannot access health endpoint at all

**Solutions:**
1. **Check if dev server is running**:
   ```bash
   npm run dev
   ```
2. **Check port availability**: Ensure port 3000 is not blocked by firewall
3. **Verify endpoint path**: Use correct URL: `http://localhost:3000/api/health`
4. **Check for long-running validations**: Detailed health checks may take time

## Diagnostic Tools Reference

### npm run validate:config

Validates environment variable configuration against requirements.

**What it checks:**
- Required variables are present
- URL formats are valid (endpoints)
- UUID formats are valid (project IDs)
- API key formats are valid
- Database ID formats are valid

**How to interpret output:**
- ✅ Green: Validation passed
- ⚠️ Yellow: Warnings (non-critical issues)
- ❌ Red: Errors (critical issues that prevent operation)

**Common errors and solutions:**
- **Missing required variables**: Add them to `.env.local`
- **Invalid URL format**: Ensure endpoints end with `/v1`
- **Invalid project ID**: Check Appwrite console for correct ID

### npm run test:connectivity

Tests actual connectivity to Appwrite services.

**What it tests:**
- Endpoint reachability
- DNS resolution
- Network connectivity
- Account service availability
- Database service availability
- Storage service availability

**How to interpret output:**
- **Success**: All services reachable, timings shown
- **Partial failure**: Some services fail, others succeed
- **Complete failure**: Cannot reach endpoint at all

**Common errors and solutions:**
- **DNS resolution failed**: Check internet connection
- **Timeout**: Increase timeout or check network latency
- **401 on account test**: Expected (no session), indicates connectivity works

### npm run test:mock-api

Tests mock backend implementation.

**What it tests:**
- Schema validation (mock data matches Appwrite schemas)
- Functional API testing (CRUD operations work)
- Response format validation
- Error handling

**How to interpret output:**
- **Schema validation**: Shows field mismatches between mock and real schemas
- **Functional tests**: Pass/fail status for each API operation
- **Overall score**: Percentage of tests passed

**Common errors and solutions:**
- **Schema mismatches**: Update mock data to match collection schemas
- **API failures**: Check mock implementation logic
- **Type errors**: Fix TypeScript type mismatches

### npm run diagnose

Runs comprehensive diagnostics across all areas.

**Comprehensive diagnostics:**
- Environment validation
- Connectivity testing (if using Appwrite)
- Mock API testing (if using mock backend)
- SDK usage checking
- Health endpoint validation

**How to interpret output:**
- **Overall health score**: 0-100% based on all checks
- **Sectioned results**: Each diagnostic area reported separately
- **Prioritized recommendations**: Most critical issues first

**How to share report for support:**
- Use `--save report.json` to export detailed report
- Include environment info and timestamps
- Share with development team for troubleshooting

## Quick Reference

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `Environment variable not found` | Missing .env.local | `cp .env.example .env.local` |
| `Invalid URL` | Malformed endpoint | Ensure URL ends with `/v1` |
| `401 Unauthorized` | Wrong project ID or API key | Check Appwrite console |
| `CORS error` | Domain not allowed | Add domain to Appwrite settings |
| `SDK guard warning` | Wrong SDK usage | Use correct import path |
| `Schema mismatch` | Mock data outdated | Update mock data |
| `Timeout` | Network issues | Check connectivity, increase timeout |

### Command Cheat Sheet

```bash
# Validate configuration
npm run validate:config

# Test connectivity
npm run test:connectivity

# Test mock API
npm run test:mock-api

# Run all diagnostics
npm run diagnose

# Check health endpoint
npm run health:check

# Create env file
cp .env.example .env.local