<!-- 14fb195c-9ca9-44b8-aa65-f9b8789639a6 f8019aaf-8a20-40ab-8125-47c6a451c775 -->
# Fix Circular Dependency in appwrite-api.ts

## Problem

The file `/Users/mac/PORTAL-2/src/lib/api/appwrite-api.ts` contains **two definitions of `messagesApi`**:

- First definition at lines 764-977
- Duplicate definition at lines 1162-1476

This causes a `ReferenceError: Cannot access 'messagesApi' before initialization` when the API is imported, preventing the application from starting.

## Solution

Remove the duplicate `messagesApi` definition (lines 1162-1476) since the first definition (lines 764-977) is already complete and functional.

## Implementation Steps

1. **Delete duplicate messagesApi** (lines 1162-1476)

- Keep the first definition (lines 764-977)
- Remove the second, duplicate definition

2. **Verify the fix**

- Ensure the application starts without the ReferenceError
- Confirm that the `appwriteApi` object correctly references the messagesApi

## Files to Modify

- `/Users/mac/PORTAL-2/src/lib/api/appwrite-api.ts` - Remove duplicate messagesApi definition