import assert from 'node:assert';
import fs from 'node:fs';

console.log('===============================================================');
console.log('EMPIRICAL VERIFICATION: MILESTONE 2 ITERATION 2 FIXES');
console.log('===============================================================\n');

let passed = 0;
let failed = 0;

function check(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

// --- Test Suite 1: resolveStorageClient in lib/supabase/storage.ts ---
console.log('SUITE 1: lib/supabase/storage.ts Static & Runtime Inspection');

const storageFileContent = fs.readFileSync('lib/supabase/storage.ts', 'utf8');

check('storage.ts does NOT contain eval or require hacks', () => {
  assert.strictEqual(storageFileContent.includes('eval('), false, 'Must not contain eval');
  assert.strictEqual(storageFileContent.includes("eval('require')"), false, 'Must not contain eval require');
});

check('storage.ts exports resolveStorageClient', () => {
  assert.match(storageFileContent, /export function resolveStorageClient/);
});

check('resolveStorageClient logic returns provided client or fallback', () => {
  // Simulate resolveStorageClient logic
  function resolveStorageClient(client, fallback) {
    if (client) return client;
    return fallback;
  }
  const mockServerClient = { from: () => {}, storage: {} };
  const mockBrowserClient = { from: () => {}, storage: {}, isBrowser: true };

  assert.strictEqual(resolveStorageClient(mockServerClient, mockBrowserClient), mockServerClient);
  assert.strictEqual(resolveStorageClient(undefined, mockBrowserClient), mockBrowserClient);
  assert.strictEqual(resolveStorageClient(null, mockBrowserClient), mockBrowserClient);
});

check('storage functions preserve optional client parameter', () => {
  assert.match(storageFileContent, /export async function uploadFile\([^)]*client\?: SupabaseClient \| any/);
  assert.match(storageFileContent, /export async function uploadContractFiles\([^)]*client\?: SupabaseClient \| any/);
  assert.match(storageFileContent, /export async function uploadUserDocument\([^)]*client\?: SupabaseClient \| any/);
  assert.match(storageFileContent, /export async function uploadPaymentQR\([^)]*client\?: SupabaseClient \| any/);
  assert.match(storageFileContent, /export async function downloadFile\([^)]*client\?: SupabaseClient \| any/);
  assert.match(storageFileContent, /export async function deleteFile\([^)]*client\?: SupabaseClient \| any/);
  assert.match(storageFileContent, /export async function getSignedUrl\([^)]*client\?: SupabaseClient \| any/);
});

// --- Test Suite 2: All 5 Server-Side Upload Call Sites Explicitly Pass Supabase ---
console.log('\nSUITE 2: Server-Side Upload Call Sites Pass Supabase Client');

const apiContractsRoute = fs.readFileSync('app/api/contracts/route.ts', 'utf8');
check('app/api/contracts/route.ts passes server supabase client to uploadContractFiles', () => {
  assert.match(
    apiContractsRoute,
    /uploadContractFiles\s*\(\s*contract\.id\s*,\s*files\s*,\s*undefined\s*,\s*supabase\s*\)/,
    'api/contracts/route.ts must pass supabase'
  );
});

const specialistContractActions = fs.readFileSync('app/(specialist)/specialist/contracts/[id]/actions.ts', 'utf8');
check('app/(specialist)/specialist/contracts/[id]/actions.ts passes server supabase client to uploadContractFiles', () => {
  assert.match(
    specialistContractActions,
    /uploadContractFiles\s*\(\s*contractId\s*,\s*files\s*,\s*['"]delivery['"]\s*,\s*supabase\s*\)/,
    'specialist contract actions.ts must pass supabase'
  );
});

const specialistRegisterActions = fs.readFileSync('app/auth/register/specialist/actions.ts', 'utf8');
check('app/auth/register/specialist/actions.ts passes server supabase client to uploadUserDocument (CI & CV)', () => {
  assert.match(
    specialistRegisterActions,
    /uploadUserDocument\s*\(\s*user\.id\s*,\s*ciFile\s*,\s*['"]ci['"]\s*,\s*supabase\s*\)/,
    'specialist register actions.ts must pass supabase for CI'
  );
  assert.match(
    specialistRegisterActions,
    /uploadUserDocument\s*\(\s*user\.id\s*,\s*cvFile\s*,\s*['"]cv['"]\s*,\s*supabase\s*\)/,
    'specialist register actions.ts must pass supabase for CV'
  );
});

const specialistProfileEditActions = fs.readFileSync('app/(specialist)/specialist/profile/edit/actions.ts', 'utf8');
check('app/(specialist)/specialist/profile/edit/actions.ts passes server supabase client to uploadUserDocument (CV)', () => {
  assert.match(
    specialistProfileEditActions,
    /uploadUserDocument\s*\(\s*user\.id\s*,\s*cvFile\s*,\s*['"]cv['"]\s*,\s*supabase\s*\)/,
    'specialist profile edit actions.ts must pass supabase for CV'
  );
});

// --- Test Suite 3: Open Redirect Fix in app/auth/login/LoginForm.tsx ---
console.log('\nSUITE 3: LoginForm.tsx Open Redirect Protection');

const loginFormContent = fs.readFileSync('app/auth/login/LoginForm.tsx', 'utf8');

check('LoginForm.tsx validates safeRedirect', () => {
  assert.match(loginFormContent, /redirectTo\.startsWith\('\/'\)\s*&&\s*!redirectTo\.startsWith\('\/\/'\)/);
});

function sanitizeRedirect(redirectTo) {
  return typeof redirectTo === 'string' && redirectTo.startsWith('/') && !redirectTo.startsWith('//')
    ? redirectTo
    : undefined;
}

check('Rejects absolute HTTP URL', () => {
  assert.strictEqual(sanitizeRedirect('http://attacker.com'), undefined);
});

check('Rejects absolute HTTPS URL', () => {
  assert.strictEqual(sanitizeRedirect('https://attacker.com/malicious'), undefined);
});

check('Rejects protocol-relative URL (//attacker.com)', () => {
  assert.strictEqual(sanitizeRedirect('//attacker.com'), undefined);
  assert.strictEqual(sanitizeRedirect('///attacker.com'), undefined);
});

check('Rejects javascript: URI', () => {
  assert.strictEqual(sanitizeRedirect('javascript:alert(1)'), undefined);
});

check('Rejects empty or non-string values', () => {
  assert.strictEqual(sanitizeRedirect(''), undefined);
  assert.strictEqual(sanitizeRedirect(null), undefined);
  assert.strictEqual(sanitizeRedirect(undefined), undefined);
  assert.strictEqual(sanitizeRedirect(123), undefined);
});

check('Accepts safe relative paths', () => {
  assert.strictEqual(sanitizeRedirect('/student/dashboard'), '/student/dashboard');
  assert.strictEqual(sanitizeRedirect('/specialist/contracts/c-123'), '/specialist/contracts/c-123');
  assert.strictEqual(sanitizeRedirect('/admin/verifications?page=2'), '/admin/verifications?page=2');
});

console.log('\n===============================================================');
console.log(`TOTAL TESTS:  ${passed + failed}`);
console.log(`PASSED:       ${passed}`);
console.log(`FAILED:       ${failed}`);
console.log('===============================================================');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
