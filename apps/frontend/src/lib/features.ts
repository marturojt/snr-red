// Feature flags for the Fase 1 "core + API" rollout. vCard and QR are hidden by
// default and only shown when explicitly enabled, so the initial production
// surface stays focused on the URL shortener + API.
//
// NEXT_PUBLIC_* vars are inlined at build time; set them in apps/frontend/.env.local.
export const FEATURE_VCARDS = process.env.NEXT_PUBLIC_FEATURE_VCARDS === 'true';
export const FEATURE_QR = process.env.NEXT_PUBLIC_FEATURE_QR === 'true';
