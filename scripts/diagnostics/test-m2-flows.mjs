/**
 * Empirical Verification Harness for Milestone 2 Flow Logic
 * 
 * Tests:
 * 1. LoginForm.tsx redirection logic per role (specialist, student, admin, super_admin)
 * 2. proxy.ts routing rules, missing profile_details, and infinite redirect loop oracle
 * 3. Logout route redirect logic with mock NextRequest (from next/server.js)
 */

import assert from 'node:assert';
import { NextRequest, NextResponse } from 'next/server.js';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

console.log('===============================================================');
console.log('EMPIRICAL VERIFICATION HARNESS: MILESTONE 2 FLOW LOGIC');
console.log('===============================================================\n');

// ============================================================================
// SUITE 1: LoginForm.tsx Redirection Logic
// ============================================================================
console.log('SUITE 1: LoginForm.tsx Role-Aware Redirection Logic');

/**
 * Exact logic from app/auth/login/LoginForm.tsx lines 98-120
 */
function resolveLoginFormDestination(authData, redirectTo, userData) {
  let destination = redirectTo;

  // If no redirectTo is supplied or if it points to default student dashboard, query role
  if (authData?.user && (!destination || destination === '/student/dashboard')) {
    const dashboardMap = {
      specialist: '/specialist/dashboard',
      admin: '/admin/dashboard',
      super_admin: '/admin/dashboard',
      student: '/student/dashboard',
    };

    if (userData?.role && dashboardMap[userData.role]) {
      destination = dashboardMap[userData.role];
    }
  }

  return destination || '/student/dashboard';
}

runTest('LoginForm: Specialist with no redirectTo routes to /specialist/dashboard', () => {
  const authData = { user: { id: 'u-spec-1' } };
  const userData = { role: 'specialist' };
  const dest = resolveLoginFormDestination(authData, undefined, userData);
  assert.strictEqual(dest, '/specialist/dashboard');
});

runTest('LoginForm: Student with no redirectTo routes to /student/dashboard', () => {
  const authData = { user: { id: 'u-stud-1' } };
  const userData = { role: 'student' };
  const dest = resolveLoginFormDestination(authData, undefined, userData);
  assert.strictEqual(dest, '/student/dashboard');
});

runTest('LoginForm: Admin with no redirectTo routes to /admin/dashboard', () => {
  const authData = { user: { id: 'u-adm-1' } };
  const userData = { role: 'admin' };
  const dest = resolveLoginFormDestination(authData, undefined, userData);
  assert.strictEqual(dest, '/admin/dashboard');
});

runTest('LoginForm: Super Admin with no redirectTo routes to /admin/dashboard', () => {
  const authData = { user: { id: 'u-sadm-1' } };
  const userData = { role: 'super_admin' };
  const dest = resolveLoginFormDestination(authData, undefined, userData);
  assert.strictEqual(dest, '/admin/dashboard');
});

runTest('LoginForm: Specialist with default /student/dashboard override routes to /specialist/dashboard', () => {
  const authData = { user: { id: 'u-spec-2' } };
  const userData = { role: 'specialist' };
  const dest = resolveLoginFormDestination(authData, '/student/dashboard', userData);
  assert.strictEqual(dest, '/specialist/dashboard');
});

runTest('LoginForm: Admin with default /student/dashboard override routes to /admin/dashboard', () => {
  const authData = { user: { id: 'u-adm-2' } };
  const userData = { role: 'admin' };
  const dest = resolveLoginFormDestination(authData, '/student/dashboard', userData);
  assert.strictEqual(dest, '/admin/dashboard');
});

runTest('LoginForm: Super Admin with default /student/dashboard override routes to /admin/dashboard', () => {
  const authData = { user: { id: 'u-sadm-2' } };
  const userData = { role: 'super_admin' };
  const dest = resolveLoginFormDestination(authData, '/student/dashboard', userData);
  assert.strictEqual(dest, '/admin/dashboard');
});

runTest('LoginForm: Student with default /student/dashboard preserves /student/dashboard', () => {
  const authData = { user: { id: 'u-stud-2' } };
  const userData = { role: 'student' };
  const dest = resolveLoginFormDestination(authData, '/student/dashboard', userData);
  assert.strictEqual(dest, '/student/dashboard');
});

runTest('LoginForm: Specialist with deep link redirectTo preserves target path', () => {
  const authData = { user: { id: 'u-spec-3' } };
  const userData = { role: 'specialist' };
  const dest = resolveLoginFormDestination(authData, '/specialist/opportunities/opp-123', userData);
  assert.strictEqual(dest, '/specialist/opportunities/opp-123');
});

runTest('LoginForm: Student with deep link redirectTo preserves target path', () => {
  const authData = { user: { id: 'u-stud-3' } };
  const userData = { role: 'student' };
  const dest = resolveLoginFormDestination(authData, '/student/contracts/c-456', userData);
  assert.strictEqual(dest, '/student/contracts/c-456');
});

runTest('LoginForm: Admin with deep link redirectTo preserves target path', () => {
  const authData = { user: { id: 'u-adm-3' } };
  const userData = { role: 'admin' };
  const dest = resolveLoginFormDestination(authData, '/admin/verifications', userData);
  assert.strictEqual(dest, '/admin/verifications');
});

runTest('LoginForm: DB query failure (userData null) gracefully falls back to /student/dashboard', () => {
  const authData = { user: { id: 'u-err-1' } };
  const userData = null;
  const dest = resolveLoginFormDestination(authData, undefined, userData);
  assert.strictEqual(dest, '/student/dashboard');
});

runTest('LoginForm: Unknown role gracefully falls back to /student/dashboard', () => {
  const authData = { user: { id: 'u-unknown' } };
  const userData = { role: 'unknown_role' };
  const dest = resolveLoginFormDestination(authData, undefined, userData);
  assert.strictEqual(dest, '/student/dashboard');
});

// ============================================================================
// SUITE 2: proxy.ts Routing Rules & Infinite Loop Detection Oracle
// ============================================================================
console.log('\nSUITE 2: proxy.ts Routing Rules & Loop Detection Oracle');

/**
 * Model of proxy.ts evaluation engine
 */
function evaluateProxyStep({ pathname, method = 'GET', user, userData, profileData, requestUrl = 'http://localhost:3000' }) {
  // Skip proxy for Server Actions (POST requests to page routes)
  if (method === 'POST' && !pathname.startsWith('/api/')) {
    return { type: 'NEXT', target: pathname };
  }

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/auth/login', '/auth/callback', '/demo'];
  const isPublicRoute = publicRoutes.some(
    route => pathname === route ||
      pathname.startsWith('/auth/register') ||
      pathname.startsWith('/auth/pending') ||
      pathname.startsWith('/auth/logout') ||
      pathname.startsWith('/auth/forgot') ||
      pathname.startsWith('/auth/reset')
  );

  // If user is not authenticated and trying to access a protected route
  if (!user && !isPublicRoute) {
    const redirectUrl = new URL('/auth/login', requestUrl);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return { type: 'REDIRECT', target: redirectUrl.pathname + redirectUrl.search };
  }

  // Authenticated user flows
  if (user) {
    // User not in DB
    if (!userData) {
      if (!pathname.startsWith('/auth/register') && !pathname.startsWith('/auth/callback')) {
        return { type: 'REDIRECT', target: '/auth/register' };
      }
      return { type: 'NEXT', target: pathname };
    }

    // Unverified users
    if (
      !userData.is_verified &&
      pathname !== '/auth/pending' &&
      pathname !== '/auth/logout' &&
      !pathname.startsWith('/auth/register')
    ) {
      return { type: 'REDIRECT', target: '/auth/pending' };
    }

    // Role-based protection for verified users
    if (userData.is_verified) {
      if (pathname.startsWith('/student') && userData.role !== 'student') {
        return { type: 'REDIRECT', target: '/' };
      }
      if (pathname.startsWith('/specialist') && userData.role !== 'specialist') {
        return { type: 'REDIRECT', target: '/' };
      }
      if (pathname.startsWith('/admin') && !['admin', 'super_admin'].includes(userData.role)) {
        return { type: 'REDIRECT', target: '/' };
      }
    }

    // Profile completeness check
    const isAdmin = ['admin', 'super_admin'].includes(userData.role);

    if (!isAdmin && userData.is_verified) {
      const isPublicOrAuthPath =
        isPublicRoute ||
        pathname.startsWith('/auth/') ||
        pathname === '/' ||
        pathname === '/demo';

      if (!isPublicOrAuthPath) {
        if (!profileData) {
          const profilePath = userData.role === 'specialist' ? '/specialist/profile' : '/student/profile';
          if (pathname !== profilePath && !pathname.startsWith(`${profilePath}/`)) {
            return { type: 'REDIRECT', target: profilePath };
          }
        }
      }
    }

    // Redirect authenticated + verified users away from login page
    if (pathname === '/auth/login' && userData.is_verified) {
      const dashboardMap = {
        student: '/student/dashboard',
        specialist: '/specialist/dashboard',
        admin: '/admin/dashboard',
        super_admin: '/admin/dashboard',
      };
      return { type: 'REDIRECT', target: dashboardMap[userData.role] || '/' };
    }

    // Redirect authenticated but not-yet-verified users away from login
    if (pathname === '/auth/login' && !userData.is_verified) {
      return { type: 'REDIRECT', target: '/auth/pending' };
    }
  }

  return { type: 'NEXT', target: pathname };
}

/**
 * Model of RegisterPage behavior (app/auth/register/page.tsx:28-42)
 * If user exists in DB and is verified, it redirects to their dashboard.
 */
function evaluateRegisterPage(pathname, user, userData) {
  if (pathname === '/auth/register' && user && userData) {
    if (!userData.is_verified) {
      return '/auth/pending';
    }
    const dashboardMap = {
      student: '/student/dashboard',
      specialist: '/specialist/dashboard',
      admin: '/admin/dashboard',
      super_admin: '/admin/dashboard',
    };
    return dashboardMap[userData.role] || '/';
  }
  return null;
}

/**
 * Graph Traversal Oracle: Detects loops and verifies termination
 */
function traceProxyExecution(initialPath, user, userData, profileData, maxHops = 10) {
  let currentPath = initialPath;
  const history = [];
  const visitedPaths = new Set();

  while (history.length < maxHops) {
    const cleanPath = currentPath.split('?')[0];

    // Check if page handler itself issues a redirect (e.g. RegisterPage)
    const pageRedirect = evaluateRegisterPage(cleanPath, user, userData);
    if (pageRedirect) {
      if (visitedPaths.has(`PAGE:${pageRedirect}`)) {
        return {
          terminated: false,
          isLoop: true,
          history,
          loopAt: pageRedirect,
          reason: 'Page redirect cycle detected',
        };
      }
      visitedPaths.add(`PAGE:${pageRedirect}`);
      history.push({ step: 'REGISTER_PAGE_REDIRECT', from: cleanPath, to: pageRedirect });
      currentPath = pageRedirect;
      continue;
    }

    // Evaluate proxy
    const result = evaluateProxyStep({ pathname: cleanPath, user, userData, profileData });
    history.push({ step: result.type, from: cleanPath, to: result.target });

    if (result.type === 'NEXT') {
      return {
        terminated: true,
        isLoop: false,
        hops: history.length,
        finalPath: cleanPath,
        history,
      };
    }

    const nextCleanPath = result.target.split('?')[0];
    const visitKey = `PROXY:${nextCleanPath}`;
    if (visitedPaths.has(visitKey)) {
      return {
        terminated: false,
        isLoop: true,
        hops: history.length,
        loopAt: nextCleanPath,
        history,
        reason: 'Proxy redirect cycle detected',
      };
    }
    visitedPaths.add(visitKey);
    currentPath = nextCleanPath;
  }

  return {
    terminated: false,
    isLoop: true,
    hops: history.length,
    history,
    reason: 'Exceeded max hops without terminating',
  };
}

// Test Matrix: Role access and profile completeness
runTest('Proxy: Student with profile accesses /student/dashboard -> Allowed', () => {
  const user = { id: 'u1' };
  const userData = { role: 'student', is_verified: true };
  const profileData = { id: 'p1' };
  const trace = traceProxyExecution('/student/dashboard', user, userData, profileData);
  assert.strictEqual(trace.terminated, true);
  assert.strictEqual(trace.isLoop, false);
  assert.strictEqual(trace.finalPath, '/student/dashboard');
  assert.strictEqual(trace.hops, 1);
});

runTest('Proxy: Student with MISSING profile accesses /student/dashboard -> Redirects to /student/profile (NO LOOP)', () => {
  const user = { id: 'u1' };
  const userData = { role: 'student', is_verified: true };
  const profileData = null; // missing profile
  const trace = traceProxyExecution('/student/dashboard', user, userData, profileData);
  assert.strictEqual(trace.terminated, true, 'Must terminate');
  assert.strictEqual(trace.isLoop, false, 'Must NOT be a loop');
  assert.strictEqual(trace.finalPath, '/student/profile');
  assert.strictEqual(trace.hops, 2); // /student/dashboard -> /student/profile (allowed)
});

runTest('Proxy: Student with MISSING profile directly accesses /student/profile -> Allowed (NO LOOP)', () => {
  const user = { id: 'u1' };
  const userData = { role: 'student', is_verified: true };
  const profileData = null;
  const trace = traceProxyExecution('/student/profile', user, userData, profileData);
  assert.strictEqual(trace.terminated, true);
  assert.strictEqual(trace.isLoop, false);
  assert.strictEqual(trace.finalPath, '/student/profile');
  assert.strictEqual(trace.hops, 1);
});

runTest('Proxy: Student with MISSING profile accesses /student/profile/edit -> Allowed (subpath prefix match)', () => {
  const user = { id: 'u1' };
  const userData = { role: 'student', is_verified: true };
  const profileData = null;
  const trace = traceProxyExecution('/student/profile/edit', user, userData, profileData);
  assert.strictEqual(trace.terminated, true);
  assert.strictEqual(trace.isLoop, false);
  assert.strictEqual(trace.finalPath, '/student/profile/edit');
  assert.strictEqual(trace.hops, 1);
});

runTest('Proxy: Specialist with profile accesses /specialist/dashboard -> Allowed', () => {
  const user = { id: 'u2' };
  const userData = { role: 'specialist', is_verified: true };
  const profileData = { id: 'p2' };
  const trace = traceProxyExecution('/specialist/dashboard', user, userData, profileData);
  assert.strictEqual(trace.terminated, true);
  assert.strictEqual(trace.isLoop, false);
  assert.strictEqual(trace.finalPath, '/specialist/dashboard');
  assert.strictEqual(trace.hops, 1);
});

runTest('Proxy: Specialist with MISSING profile accesses /specialist/dashboard -> Redirects to /specialist/profile (NO LOOP)', () => {
  const user = { id: 'u2' };
  const userData = { role: 'specialist', is_verified: true };
  const profileData = null; // missing profile
  const trace = traceProxyExecution('/specialist/dashboard', user, userData, profileData);
  assert.strictEqual(trace.terminated, true);
  assert.strictEqual(trace.isLoop, false);
  assert.strictEqual(trace.finalPath, '/specialist/profile');
  assert.strictEqual(trace.hops, 2);
});

runTest('Proxy: Specialist with MISSING profile accesses /specialist/profile -> Allowed', () => {
  const user = { id: 'u2' };
  const userData = { role: 'specialist', is_verified: true };
  const profileData = null;
  const trace = traceProxyExecution('/specialist/profile', user, userData, profileData);
  assert.strictEqual(trace.terminated, true);
  assert.strictEqual(trace.isLoop, false);
  assert.strictEqual(trace.finalPath, '/specialist/profile');
  assert.strictEqual(trace.hops, 1);
});

runTest('Proxy: Admin with MISSING profile accesses /admin/dashboard -> Allowed (profile check completely bypassed)', () => {
  const user = { id: 'u3' };
  const userData = { role: 'admin', is_verified: true };
  const profileData = null; // SQL-created admin without profile_details
  const trace = traceProxyExecution('/admin/dashboard', user, userData, profileData);
  assert.strictEqual(trace.terminated, true);
  assert.strictEqual(trace.isLoop, false);
  assert.strictEqual(trace.finalPath, '/admin/dashboard');
  assert.strictEqual(trace.hops, 1, 'Admin must not be redirected when profile_details is missing');
});

runTest('Proxy: Super Admin with MISSING profile accesses /admin/dashboard -> Allowed', () => {
  const user = { id: 'u4' };
  const userData = { role: 'super_admin', is_verified: true };
  const profileData = null;
  const trace = traceProxyExecution('/admin/dashboard', user, userData, profileData);
  assert.strictEqual(trace.terminated, true);
  assert.strictEqual(trace.isLoop, false);
  assert.strictEqual(trace.finalPath, '/admin/dashboard');
  assert.strictEqual(trace.hops, 1);
});

runTest('Proxy: Student unauthorized access to /specialist/dashboard -> Redirects to /', () => {
  const user = { id: 'u1' };
  const userData = { role: 'student', is_verified: true };
  const profileData = { id: 'p1' };
  const trace = traceProxyExecution('/specialist/dashboard', user, userData, profileData);
  assert.strictEqual(trace.terminated, true);
  assert.strictEqual(trace.isLoop, false);
  assert.strictEqual(trace.finalPath, '/');
  assert.strictEqual(trace.hops, 2);
});

runTest('Proxy: Student unauthorized access to /admin/dashboard -> Redirects to /', () => {
  const user = { id: 'u1' };
  const userData = { role: 'student', is_verified: true };
  const profileData = { id: 'p1' };
  const trace = traceProxyExecution('/admin/dashboard', user, userData, profileData);
  assert.strictEqual(trace.terminated, true);
  assert.strictEqual(trace.isLoop, false);
  assert.strictEqual(trace.finalPath, '/');
  assert.strictEqual(trace.hops, 2);
});

runTest('Proxy: Specialist unauthorized access to /student/dashboard -> Redirects to /', () => {
  const user = { id: 'u2' };
  const userData = { role: 'specialist', is_verified: true };
  const profileData = { id: 'p2' };
  const trace = traceProxyExecution('/student/dashboard', user, userData, profileData);
  assert.strictEqual(trace.terminated, true);
  assert.strictEqual(trace.isLoop, false);
  assert.strictEqual(trace.finalPath, '/');
  assert.strictEqual(trace.hops, 2);
});

runTest('Proxy: Specialist unauthorized access to /admin/dashboard -> Redirects to /', () => {
  const user = { id: 'u2' };
  const userData = { role: 'specialist', is_verified: true };
  const profileData = { id: 'p2' };
  const trace = traceProxyExecution('/admin/dashboard', user, userData, profileData);
  assert.strictEqual(trace.terminated, true);
  assert.strictEqual(trace.isLoop, false);
  assert.strictEqual(trace.finalPath, '/');
  assert.strictEqual(trace.hops, 2);
});

runTest('Proxy: Admin access to /student/dashboard -> Redirects to /', () => {
  const user = { id: 'u3' };
  const userData = { role: 'admin', is_verified: true };
  const profileData = null;
  const trace = traceProxyExecution('/student/dashboard', user, userData, profileData);
  assert.strictEqual(trace.terminated, true);
  assert.strictEqual(trace.isLoop, false);
  assert.strictEqual(trace.finalPath, '/');
  assert.strictEqual(trace.hops, 2);
});

runTest('Proxy: Unauthenticated user accessing /student/dashboard -> Redirects to login with redirectTo', () => {
  const trace = traceProxyExecution('/student/dashboard', null, null, null);
  assert.strictEqual(trace.terminated, true);
  assert.strictEqual(trace.isLoop, false);
  assert.strictEqual(trace.finalPath, '/auth/login');
  assert.strictEqual(trace.hops, 2);
});

runTest('Proxy: Authenticated verified specialist visiting /auth/login -> Redirects to /specialist/dashboard', () => {
  const user = { id: 'u2' };
  const userData = { role: 'specialist', is_verified: true };
  const profileData = { id: 'p2' };
  const trace = traceProxyExecution('/auth/login', user, userData, profileData);
  assert.strictEqual(trace.terminated, true);
  assert.strictEqual(trace.isLoop, false);
  assert.strictEqual(trace.finalPath, '/specialist/dashboard');
  assert.strictEqual(trace.hops, 2);
});

runTest('Proxy: Authenticated verified student visiting /auth/login -> Redirects to /student/dashboard', () => {
  const user = { id: 'u1' };
  const userData = { role: 'student', is_verified: true };
  const profileData = { id: 'p1' };
  const trace = traceProxyExecution('/auth/login', user, userData, profileData);
  assert.strictEqual(trace.terminated, true);
  assert.strictEqual(trace.isLoop, false);
  assert.strictEqual(trace.finalPath, '/student/dashboard');
  assert.strictEqual(trace.hops, 2);
});

runTest('Proxy: Authenticated verified admin visiting /auth/login -> Redirects to /admin/dashboard', () => {
  const user = { id: 'u3' };
  const userData = { role: 'admin', is_verified: true };
  const profileData = null;
  const trace = traceProxyExecution('/auth/login', user, userData, profileData);
  assert.strictEqual(trace.terminated, true);
  assert.strictEqual(trace.isLoop, false);
  assert.strictEqual(trace.finalPath, '/admin/dashboard');
  assert.strictEqual(trace.hops, 2);
});

runTest('Proxy: Authenticated verified super_admin visiting /auth/login -> Redirects to /admin/dashboard', () => {
  const user = { id: 'u4' };
  const userData = { role: 'super_admin', is_verified: true };
  const profileData = null;
  const trace = traceProxyExecution('/auth/login', user, userData, profileData);
  assert.strictEqual(trace.terminated, true);
  assert.strictEqual(trace.isLoop, false);
  assert.strictEqual(trace.finalPath, '/admin/dashboard');
  assert.strictEqual(trace.hops, 2);
});

runTest('Proxy: Authenticated UNVERIFIED user visiting /auth/login -> Redirects to /auth/pending', () => {
  const user = { id: 'u5' };
  const userData = { role: 'student', is_verified: false };
  const profileData = null;
  const trace = traceProxyExecution('/auth/login', user, userData, profileData);
  assert.strictEqual(trace.terminated, true);
  assert.strictEqual(trace.isLoop, false);
  assert.strictEqual(trace.finalPath, '/auth/pending');
  assert.strictEqual(trace.hops, 2);
});

runTest('Proxy: Authenticated UNVERIFIED user visiting protected route -> Redirects to /auth/pending', () => {
  const user = { id: 'u5' };
  const userData = { role: 'student', is_verified: false };
  const profileData = null;
  const trace = traceProxyExecution('/student/dashboard', user, userData, profileData);
  assert.strictEqual(trace.terminated, true);
  assert.strictEqual(trace.isLoop, false);
  assert.strictEqual(trace.finalPath, '/auth/pending');
  assert.strictEqual(trace.hops, 2);
});

// Regression Stress Test: Prior Bug Loop Scenario
runTest('Regression Oracle: Verification that old loop is completely eliminated', () => {
  // In the old code:
  // Admin without profile details went to /admin/dashboard -> proxy redirected to /auth/register ->
  // RegisterPage redirected to /admin/dashboard -> proxy redirected to /auth/register -> INFINITE LOOP.
  // In new code:
  const user = { id: 'u-sql-admin' };
  const userData = { role: 'admin', is_verified: true };
  const profileData = null; // No profile details
  const trace = traceProxyExecution('/admin/dashboard', user, userData, profileData);
  assert.strictEqual(trace.isLoop, false);
  assert.strictEqual(trace.terminated, true);
  assert.strictEqual(trace.finalPath, '/admin/dashboard');
  assert.strictEqual(trace.hops, 1);
});

// ============================================================================
// SUITE 3: Logout Route Redirect Logic with Mock NextRequest
// ============================================================================
console.log('\nSUITE 3: Logout Route Redirect Logic with Mock NextRequest');

/**
 * Exact redirect logic from app/auth/logout/route.ts lines 4-9
 */
function handleLogoutRedirect(request) {
  return NextResponse.redirect(new URL('/', request.url));
}

runTest('Logout: Localhost mock NextRequest redirects to http://localhost:3000/', () => {
  const req = new NextRequest('http://localhost:3000/auth/logout');
  const res = handleLogoutRedirect(req);
  assert.strictEqual(res.status, 307);
  assert.strictEqual(res.headers.get('location'), 'http://localhost:3000/');
});

runTest('Logout: Production domain mock NextRequest redirects to https://laredarcana.com/', () => {
  const req = new NextRequest('https://laredarcana.com/auth/logout');
  const res = handleLogoutRedirect(req);
  assert.strictEqual(res.status, 307);
  assert.strictEqual(res.headers.get('location'), 'https://laredarcana.com/');
});

runTest('Logout: Staging subdomain mock NextRequest preserves staging origin', () => {
  const req = new NextRequest('https://staging.laredarcana.com/auth/logout?clear=1');
  const res = handleLogoutRedirect(req);
  assert.strictEqual(res.status, 307);
  assert.strictEqual(res.headers.get('location'), 'https://staging.laredarcana.com/');
});

runTest('Logout: Custom port mock NextRequest preserves port', () => {
  const req = new NextRequest('http://192.168.1.100:8080/auth/logout');
  const res = handleLogoutRedirect(req);
  assert.strictEqual(res.status, 307);
  assert.strictEqual(res.headers.get('location'), 'http://192.168.1.100:8080/');
});

runTest('Logout: Vercel preview deployment preserves unique preview origin', () => {
  const req = new NextRequest('https://red-arcana-git-refactor-orden-agy.vercel.app/auth/logout');
  const res = handleLogoutRedirect(req);
  assert.strictEqual(res.status, 307);
  assert.strictEqual(res.headers.get('location'), 'https://red-arcana-git-refactor-orden-agy.vercel.app/');
});

// ============================================================================
// SUMMARY & VERDICT
// ============================================================================
console.log('\n===============================================================');
console.log(`TOTAL TESTS:  ${totalTests}`);
console.log(`PASSED:       ${passedTests}`);
console.log(`FAILED:       ${failedTests}`);
console.log('===============================================================');

if (failedTests > 0) {
  console.error('\nOVERALL VERDICT: FAIL');
  process.exit(1);
} else {
  console.log('\nOVERALL VERDICT: APPROVE');
  process.exit(0);
}
