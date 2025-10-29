# @repo/cloud-code

> **STUB-ONLY**: This package provides a future-ready interface for cloud-code execution. Currently returns stub responses only (non-blocking).

## Overview

The `@repo/cloud-code` package provides a TypeScript interface for executing serverless functions in a cloud environment. This is a **stub implementation** that is fully tree-shakeable and non-blocking.

**Current Status**: All operations return stub responses. No actual cloud-code backend is implemented yet.

## Features

- ✅ **Feature-flagged**: Disabled by default (`CLOUD_CODE_ENABLED=false`)
- ✅ **Non-blocking**: Never breaks the build or runtime
- ✅ **Tree-shakeable**: Zero runtime cost when unused
- ✅ **Type-safe**: Full TypeScript support
- ✅ **Tested**: Unit tests verify stub behavior
- 🚧 **Backend**: To be implemented

## Installation

This package is part of the monorepo workspace and doesn't require separate installation:

```typescript
import { executeFunction } from '@repo/cloud-code';
```

## Usage

### Basic Execution

```typescript
import { executeFunction } from '@repo/cloud-code';

// Execute a function (returns stub by default)
const result = await executeFunction({
  functionName: 'processPayment',
  parameters: {
    amount: 100,
    currency: 'USD',
  },
});

if (result.enabled === false) {
  console.log('Cloud-code is disabled:', result.message);
} else if (result.success) {
  console.log('Result:', result.result);
} else {
  console.error('Error:', result.error);
}
```

### Batch Execution

```typescript
import { executeBatch } from '@repo/cloud-code';

const results = await executeBatch([
  { functionName: 'sendEmail', parameters: { to: 'user@example.com' } },
  { functionName: 'logEvent', parameters: { event: 'user_signup' } },
  { functionName: 'updateCache', parameters: { key: 'stats' } },
]);

results.forEach((result, index) => {
  console.log(`Function ${index}:`, result);
});
```

### Health Check

```typescript
import { healthCheck } from '@repo/cloud-code';

const health = await healthCheck();

console.log('Enabled:', health.enabled);
console.log('Healthy:', health.healthy);
if (health.error) {
  console.log('Error:', health.error);
}
```

### Configuration Info

```typescript
import { getCloudCodeInfo } from '@repo/cloud-code';

const config = getCloudCodeInfo();

console.log('Configuration:', config);
// Output: { enabled: false, timeout: 30000, retryAttempts: 3 }
```

## Environment Variables

Add these to your `.env.local` file to enable cloud-code (when backend is implemented):

```bash
# Enable cloud-code execution (default: false)
CLOUD_CODE_ENABLED=false

# Cloud-code service endpoint (required when enabled)
CLOUD_CODE_ENDPOINT=https://cloud-code.example.com

# API key for authentication (required when enabled)
CLOUD_CODE_API_KEY=your-api-key-here

# Request timeout in milliseconds (default: 30000)
CLOUD_CODE_TIMEOUT=30000

# Number of retry attempts on failure (default: 3)
CLOUD_CODE_RETRY_ATTEMPTS=3
```

## API Reference

### `executeFunction(request: ExecutionRequest): Promise<CloudFunctionResult>`

Execute a single cloud function.

**Parameters:**
- `request.functionName` (string, required): Name of the function to execute
- `request.parameters` (object, optional): Function parameters
- `request.timeout` (number, optional): Execution timeout in ms
- `request.metadata` (object, optional): Additional metadata

**Returns:**
- `ExecutionResponse` - Success response with result
- `StubResponse` - Stub when disabled
- `ErrorResponse` - Error response

### `executeBatch(requests: ExecutionRequest[]): Promise<CloudFunctionResult[]>`

Execute multiple cloud functions in parallel.

**Parameters:**
- `requests` (array): Array of execution requests

**Returns:**
- Array of results (one per request)

### `healthCheck(): Promise<{enabled: boolean; healthy: boolean; error?: string}>`

Check if cloud-code service is enabled and healthy.

**Returns:**
- `enabled` - Whether cloud-code is enabled
- `healthy` - Whether service is healthy
- `error` - Optional error message

### `getCloudCodeInfo(): object`

Get current configuration (safe to expose).

**Returns:**
- Object with configuration (excludes sensitive fields like `apiKey`)

## Type Definitions

### ExecutionRequest

```typescript
interface ExecutionRequest {
  functionName: string;
  parameters?: Record<string, any>;
  timeout?: number;
  metadata?: Record<string, any>;
}
```

### ExecutionResponse

```typescript
interface ExecutionResponse {
  success: true;
  result: any;
  executionId: string;
  executionTime: number;
  timestamp: string;
}
```

### StubResponse

```typescript
interface StubResponse {
  enabled: false;
  message: string;
  timestamp: string;
}
```

### ErrorResponse

```typescript
interface ErrorResponse {
  success: false;
  error: string;
  code: string;
  timestamp: string;
}
```

## Testing

Run tests for this package:

```bash
# From package directory
yarn test

# From monorepo root
yarn workspace @repo/cloud-code test

# With Turbo (all packages)
yarn test
```

All tests verify that stub responses are returned when cloud-code is disabled.

## Development Roadmap

This package is ready for future cloud-code integration. When implementing:

1. **Add Backend Service**: Deploy cloud-code execution service
2. **Update client.ts**: Uncomment HTTP calls to backend
3. **Add Authentication**: Implement API key validation
4. **Add Retry Logic**: Handle transient failures
5. **Add Monitoring**: Track execution metrics
6. **Add Rate Limiting**: Prevent abuse

## Examples

### Next.js API Route

```typescript
// app/api/cloud-code/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { executeFunction } from '@repo/cloud-code';

export async function POST(request: NextRequest) {
  const body = await request.json();

  const result = await executeFunction({
    functionName: body.functionName,
    parameters: body.parameters,
  });

  if (result.enabled === false) {
    return NextResponse.json(
      { message: result.message },
      { status: 503 }
    );
  }

  return NextResponse.json(result);
}
```

### React Component

```typescript
import { executeFunction } from '@repo/cloud-code';
import { useState } from 'react';

export function CloudCodeButton() {
  const [result, setResult] = useState<string>('');

  const handleClick = async () => {
    const res = await executeFunction({
      functionName: 'hello',
      parameters: { name: 'World' },
    });

    if (res.enabled === false) {
      setResult('Cloud-code is disabled');
    } else if (res.success) {
      setResult(`Success: ${res.result}`);
    } else {
      setResult(`Error: ${res.error}`);
    }
  };

  return (
    <div>
      <button onClick={handleClick}>Execute Function</button>
      <p>{result}</p>
    </div>
  );
}
```

## Security

- ✅ API keys and endpoints are never exposed in client builds
- ✅ `getCloudCodeInfo()` excludes sensitive fields
- ✅ All requests should be validated server-side
- ✅ Implement rate limiting when backend is added

## Tree-Shaking

This package is marked with `"sideEffects": false` in `package.json`, enabling automatic tree-shaking:

- If you don't import from this package, it won't be included in your bundle
- If cloud-code is disabled, the package has minimal runtime cost
- All stub responses are lightweight and fast

## Troubleshooting

### "Cloud-code is disabled" Message

This is expected behavior. Cloud-code is disabled by default. To enable (when backend is ready):

```bash
CLOUD_CODE_ENABLED=true
CLOUD_CODE_ENDPOINT=https://your-backend.example.com
CLOUD_CODE_API_KEY=your-api-key
```

### Type Errors

Ensure you're using TypeScript 5+ and have proper type definitions:

```bash
yarn workspace @repo/cloud-code typecheck
```

### Tests Failing

Run tests with verbose output:

```bash
yarn workspace @repo/cloud-code test --reporter=verbose
```

## Contributing

When implementing the cloud-code backend:

1. Update `client.ts` with real HTTP calls
2. Add integration tests
3. Update this README with backend setup instructions
4. Add error codes documentation
5. Add rate limiting and retry logic

## License

Private package - part of the monorepo.

---

**Remember**: This package is currently stub-only and non-blocking. It's safe to import and use anywhere without affecting build or runtime.
