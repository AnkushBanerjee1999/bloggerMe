// Test script for Phase 5 Security & Authentication Audit
const BASE_URL = 'http://localhost:5000/api/v1';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  let json;
  try {
    json = await res.json();
  } catch (e) {
    json = null;
  }
  return { status: res.status, ok: res.ok, data: json, headers: res.headers };
}

async function runTests() {
  const results = [];
  const testId = Date.now();

  function record(suite, testName, passed, details = '') {
    results.push({ suite, testName, passed, details });
    const mark = passed ? '✅' : '❌';
    console.log(`${mark} [${suite}] ${testName}: ${details}`);
  }

  console.log('--- STARTING PHASE 5 SECURITY & AUTH AUDIT SUITE ---');

  // 1. REGISTRATION TESTS
  const validEmail = `sec_user_${testId}@test.com`;
  const validPass = 'SecurePass123!';
  
  // 1.1 Valid Registration
  const r1 = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Security User', email: validEmail, password: validPass }),
  });
  record('Registration', 'Valid Registration', r1.status === 201 && r1.data?.success === true && r1.data?.data?.user?.role === 'user', `Status: ${r1.status}`);

  // 1.2 Duplicate Email
  const r2 = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Security User Dup', email: validEmail, password: validPass }),
  });
  record('Registration', 'Duplicate Email Rejection', r2.status === 409 && r2.data?.success === false, `Status: ${r2.status}, Code: ${r2.data?.error?.code}`);

  // 1.3 Invalid Email format
  const r3 = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Bad Email', email: 'not-an-email', password: validPass }),
  });
  record('Registration', 'Invalid Email Format', r3.status === 422 && r3.data?.success === false, `Status: ${r3.status}, Code: ${r3.data?.error?.code}`);

  // 1.4 Weak/Short Password (< 6 chars)
  const r4 = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Short Pass', email: `short_${testId}@test.com`, password: '123' }),
  });
  record('Registration', 'Weak/Short Password Rejection', r4.status === 422 && r4.data?.success === false, `Status: ${r4.status}`);

  // 1.5 Role Escalation in Register (attempt role: "admin")
  const r5 = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Hacker Admin', email: `hacker_${testId}@test.com`, password: validPass, role: 'admin' }),
  });
  const hackerUser = r5.data?.data?.user;
  record('Registration', 'Role Escalation Prevention (Public Register)', r5.status === 201 && hackerUser?.role === 'user', `Actual assigned role: ${hackerUser?.role}`);

  // 2. PASSWORD SECURITY & MODEL RESPONSE
  const rUser = r1.data?.data?.user;
  const noPasswordExposed = !rUser?.password && !r5.data?.data?.user?.password;
  record('Password Security', 'Password field excluded from responses', noPasswordExposed, 'No password field in user object');

  // 3. LOGIN TESTS
  // 3.1 Valid Login
  const l1 = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: validEmail, password: validPass }),
  });
  record('Login', 'Valid Login', l1.status === 200 && l1.data?.data?.tokens?.accessToken && l1.data?.data?.tokens?.refreshToken, `Status: ${l1.status}`);

  // 3.2 Wrong Password
  const l2 = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: validEmail, password: 'WrongPassword999!' }),
  });
  record('Login', 'Wrong Password Rejection', l2.status === 401 && l2.data?.success === false, `Status: ${l2.status}`);

  // 3.3 Nonexistent Account
  const l3 = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: `nonexistent_${testId}@test.com`, password: validPass }),
  });
  record('Login', 'Nonexistent Account Rejection (Generic message)', l3.status === 401 && l3.data?.error?.code === 'INVALID_CREDENTIALS', `Code: ${l3.data?.error?.code}`);

  // 3.4 Malformed Request Body
  const l4 = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'bad' }),
  });
  record('Login', 'Malformed Login Payload', l4.status === 422, `Status: ${l4.status}`);

  // 4. ACCESS TOKEN TESTS
  const userAccessToken = l1.data?.data?.tokens?.accessToken;
  const userRefreshToken = l1.data?.data?.tokens?.refreshToken;

  // 4.1 Valid Token
  const a1 = await request('/auth/me', {
    headers: { Authorization: `Bearer ${userAccessToken}` },
  });
  record('Access Token', 'Valid Access Token accepted on /auth/me', a1.status === 200 && a1.data?.data?.user?.email === validEmail, `Status: ${a1.status}`);

  // 4.2 Missing Token
  const a2 = await request('/auth/me');
  record('Access Token', 'Missing Token rejected (401 NO_TOKEN)', a2.status === 401 && a2.data?.error?.code === 'NO_TOKEN', `Status: ${a2.status}, Code: ${a2.data?.error?.code}`);

  // 4.3 Malformed Token
  const a3 = await request('/auth/me', {
    headers: { Authorization: 'Bearer thisisnotavalidjwt' },
  });
  record('Access Token', 'Malformed Token rejected (401 INVALID_TOKEN)', a3.status === 401 && a3.data?.error?.code === 'INVALID_TOKEN', `Status: ${a3.status}, Code: ${a3.data?.error?.code}`);

  // 4.4 Refresh Token treated as Access Token (should fail because different secrets)
  const a4 = await request('/auth/me', {
    headers: { Authorization: `Bearer ${userRefreshToken}` },
  });
  record('Access Token', 'Refresh token cannot be used as Access token (distinct secrets)', a4.status === 401 && a4.data?.error?.code === 'INVALID_TOKEN', `Status: ${a4.status}`);

  // 5. REFRESH TOKEN TESTS & REVOCATION
  // 5.1 Valid Refresh
  const ref1 = await request('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: userRefreshToken }),
  });
  const newAccess = ref1.data?.data?.tokens?.accessToken;
  const newRefresh = ref1.data?.data?.tokens?.refreshToken;
  record('Refresh Token', 'Valid Refresh issues new tokens', ref1.status === 200 && !!newAccess && !!newRefresh, `Status: ${ref1.status}`);

  // 5.2 Invalid Refresh Token
  const ref2 = await request('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: 'bogus.refresh.token' }),
  });
  record('Refresh Token', 'Invalid Refresh Token rejected (401)', ref2.status === 401, `Status: ${ref2.status}`);

  // 5.3 Access Token cannot be used as Refresh Token
  const ref3 = await request('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: userAccessToken }),
  });
  record('Refresh Token', 'Access token rejected at /auth/refresh', ref3.status === 401, `Status: ${ref3.status}`);

  // 5.4 Logout and Revocation
  const lo = await request('/auth/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${newAccess}` },
    body: JSON.stringify({ refreshToken: newRefresh }),
  });
  record('Logout', 'Logout succeeds', lo.status === 200, `Status: ${lo.status}`);

  // 5.5 Attempt to refresh with the token after logout
  const refAfterLogout = await request('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: newRefresh }),
  });
  record('Refresh Token Revocation', 'Refresh token rejected after logout (Revoked)', refAfterLogout.status === 401 && (refAfterLogout.data?.error?.code === 'REVOKED_TOKEN' || refAfterLogout.data?.error?.code === 'INVALID_REFRESH_TOKEN'), `Status: ${refAfterLogout.status}, Code: ${refAfterLogout.data?.error?.code}`);

  // 6. AUTHORIZATION (RBAC) & OWNERSHIP
  // 6.1 User tries admin-only endpoint
  const userAdminCheck = await request('/admin/stats', {
    headers: { Authorization: `Bearer ${userAccessToken}` },
  });
  record('Authorization RBAC', 'Standard user forbidden from admin endpoint (403 FORBIDDEN)', userAdminCheck.status === 403 && userAdminCheck.data?.error?.code === 'FORBIDDEN', `Status: ${userAdminCheck.status}, Code: ${userAdminCheck.data?.error?.code}`);

  // 6.2 Admin login and access admin endpoint
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@example.com', password: 'change-this-password' }),
  });
  const adminAccessToken = adminLogin.data?.data?.tokens?.accessToken;
  const adminStats = await request('/admin/stats', {
    headers: { Authorization: `Bearer ${adminAccessToken}` },
  });
  record('Authorization RBAC', 'Admin accesses admin endpoint successfully (200 OK)', adminStats.status === 200 && adminStats.data?.success === true, `Status: ${adminStats.status}`);

  // 7. CORS VERIFICATION
  const corsCheck = await fetch(`${BASE_URL}/health`, {
    headers: { Origin: 'http://localhost:5173' },
  });
  const allowOrigin = corsCheck.headers.get('access-control-allow-origin');
  const allowCredentials = corsCheck.headers.get('access-control-allow-credentials');
  record('CORS', 'CORS configured for CLIENT_URL with credentials', allowOrigin === 'http://localhost:5173' && allowCredentials === 'true', `Origin: ${allowOrigin}, Credentials: ${allowCredentials}`);

  console.log('\n--- AUDIT SUMMARY ---');
  const allPassed = results.every(r => r.passed);
  console.log(`Total tests: ${results.length}, Passed: ${results.filter(r => r.passed).length}, Failed: ${results.filter(r => !r.passed).length}`);
  console.log(`Audit status: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
}

runTests().catch(console.error);
