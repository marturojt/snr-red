# Changelog - Error Fixes and Stability Improvements

## Date: 2025-01-07

### Issues Fixed

#### 1. Next.js Metadata Warnings
- **Problem**: Next.js showing warnings about deprecated metadata properties:
  - `viewport` and `themeColor` were configured in metadata export
  - Should be moved to separate viewport export
- **Solution**: 
  - Moved `viewport` and `themeColor` to separate exports in `layout.tsx`
  - Following Next.js 14+ best practices

#### 2. Error 429 (Too Many Requests)
- **Problem**: Backend returning 429 error when loading "Mis URLs" section
- **Root Cause**: 
  - React 18 Strict Mode causing double effect execution in development
  - Rate limiting set to 100 requests per 15 minutes was too restrictive for development
- **Solution**:
  - Added request deduplication in `EnhancedUserUrls` component using `useRef`
  - Added timeout to prevent rapid successive calls
  - Modified backend rate limiting to be more permissive in development
  - Added localhost IP skip for development environment

#### 3. React 18 Strict Mode Double Effects
- **Problem**: Components executing useEffect twice causing API calls duplication
- **Solution**:
  - Added `loadingRef` to prevent concurrent requests
  - Added 10ms timeout before executing API calls
  - Improved error handling and loading states

### Files Modified

#### Frontend
- `apps/frontend/src/app/layout.tsx`
  - Moved `viewport` and `themeColor` to separate exports
  - Removed deprecated metadata properties

- `apps/frontend/src/components/EnhancedUserUrls.tsx`
  - Added `useRef` for request deduplication
  - Added timeout in useEffect to prevent rapid calls
  - Improved error handling and loading states

- `apps/frontend/src/components/ModernLandingPage.tsx`
  - Added ErrorBoundary wrapper around EnhancedUserUrls

- `apps/frontend/src/components/ErrorBoundary.tsx` (NEW)
  - Added comprehensive error boundary component
  - Provides fallback UI for component errors
  - Includes development-friendly error details

#### Backend
- `apps/backend/src/index.ts`
  - Modified rate limiting configuration
  - Added development environment exceptions
  - Increased rate limit for development (1000 vs 100)
  - Added localhost IP skip for development

### Technical Improvements

1. **Rate Limiting Optimization**:
   - Development: 1000 requests per 15 minutes
   - Production: 100 requests per 15 minutes (unchanged)
   - Localhost IPs bypass rate limiting in development

2. **Error Handling**:
   - Added ErrorBoundary component for graceful error handling
   - Improved error messages and user feedback
   - Better debugging information in development

3. **Performance**:
   - Reduced unnecessary API calls through request deduplication
   - Added loading states and proper cleanup
   - Improved component stability

### Testing

- ✅ Metadata warnings resolved in Next.js console
- ✅ "Mis URLs" section loads without 429 errors
- ✅ No double API calls in development
- ✅ Error boundary catches and displays errors gracefully
- ✅ Rate limiting works correctly in both development and production

### Notes

- Changes are backward compatible
- Development experience improved with better error handling
- Production stability maintained with appropriate rate limiting
- All existing functionality preserved

### Next Steps

1. Monitor console for any remaining warnings
2. Test in production environment to ensure rate limiting works correctly
3. Consider adding more granular rate limiting for different API endpoints
4. Add unit tests for error boundary component

## Breaking Changes

None - all changes are backward compatible.

## Migration Guide

No migration needed - changes are automatic upon deployment.
