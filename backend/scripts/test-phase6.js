// Test suite for Phase 6 OAuth Integration
const BASE_URL = 'http://localhost:5000/api/v1';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    redirect: 'manual', // do not follow redirect so we can inspect Location headers
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  let json = null;
  try {
    json = await res.json();
  } catch (e) {}
  return { status: res.status, headers: res.headers, data: json };
}

async function runOAuthTests() {
  console.log('--- STARTING PHASE 6 OAUTH INTEGRATION TESTS ---');
  const results = [];
  const testId = Date.now();

  function record(suite, testName, passed, details = '') {
    results.push({ suite, testName, passed, details });
    const mark = passed ? '✅' : '❌';
    console.log(`${mark} [${suite}] ${testName}: ${details}`);
  }

  // 1. Google OAuth initiation route (when unconfigured or configured)
  const g1 = await request('/auth/google');
  // Either 302 redirect to accounts.google.com or 503 OAUTH_NOT_CONFIGURED if credentials not set in env
  const gInitiateValid = (g1.status === 302 && g1.headers.get('location')?.includes('accounts.google.com')) || 
                        (g1.status === 503 && g1.data?.error?.code === 'OAUTH_NOT_CONFIGURED');
  record('Google OAuth', 'Initiation endpoint (/auth/google)', gInitiateValid, `Status: ${g1.status}`);

  // 2. Facebook OAuth initiation route
  const fb1 = await request('/auth/facebook');
  const fbInitiateValid = (fb1.status === 302 && fb1.headers.get('location')?.includes('facebook.com')) || 
                          (fb1.status === 503 && fb1.data?.error?.code === 'OAUTH_NOT_CONFIGURED');
  record('Facebook OAuth', 'Initiation endpoint (/auth/facebook)', fbInitiateValid, `Status: ${fb1.status}`);

  // 3. Callback error handling (e.g. user denied consent or error passed by provider)
  const gErr = await request('/auth/google/callback?error=access_denied');
  const gErrRedirect = gErr.status === 302 && gErr.headers.get('location')?.includes('/login?error=access_denied');
  record('Google OAuth', 'Consent denied error handling', gErrRedirect, `Redirects to frontend login with error param`);

  const fbErr = await request('/auth/facebook/callback?error=access_denied&error_description=User%20canceled');
  const fbErrRedirect = fbErr.status === 302 && fbErr.headers.get('location')?.includes('/login?error=');
  record('Facebook OAuth', 'Consent denied error handling', fbErrRedirect, `Redirects to frontend login with error param`);

  // 4. Missing code handling
  const gNoCode = await request('/auth/google/callback');
  const gNoCodeRedirect = gNoCode.status === 302 && gNoCode.headers.get('location')?.includes('/login?error=missing_code');
  record('Google OAuth', 'Missing authorization code handling', gNoCodeRedirect, `Redirects safely to login`);

  // 5. Direct verification of handleOAuthLogin service logic (Account Linking & Role Security)
  const mongoose = (await import('mongoose')).default;
  const { config } = await import('../dist/config/index.js');
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(config.mongodbUri);
  }
  const { authService } = await import('../dist/services/auth.service.js');
  const { UserModel } = await import('../dist/models/User.js');

  const oauthEmail = `oauth_test_${testId}@example.com`;
  const oauthRes1 = await authService.handleOAuthLogin({
    provider: 'google',
    providerId: `google_id_${testId}`,
    email: oauthEmail,
    name: 'OAuth User',
    avatar: 'https://lh3.googleusercontent.com/photo.jpg',
  });

  const isUserRole = oauthRes1.user.role === 'user';
  const hasTokens = !!oauthRes1.tokens.accessToken && !!oauthRes1.tokens.refreshToken;
  record('Account Creation', 'OAuth account created with default role = "user"', isUserRole && hasTokens, `Assigned role: ${oauthRes1.user.role}`);

  // 6. Account Linking with existing account (No duplicate created)
  const oauthRes2 = await authService.handleOAuthLogin({
    provider: 'facebook',
    providerId: `fb_id_${testId}`,
    email: oauthEmail, // same email!
    name: 'OAuth Linked User',
  });

  const sameUserId = oauthRes1.user.id === oauthRes2.user.id;
  const countUsers = await UserModel.countDocuments({ email: oauthEmail });
  record('Account Linking', 'Existing email matches and links without duplicate user', sameUserId && countUsers === 1, `Users matching email: ${countUsers}`);

  // 7. Role Preservation (Admin cannot be downgraded to user, user cannot be escalated to admin)
  // Test linking with existing admin
  const adminEmail = `admin_oauth_${testId}@example.com`;
  const adminUser = await UserModel.create({
    name: 'Admin Pre-existing',
    email: adminEmail,
    password: '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnop',
    role: 'admin',
    provider: 'local',
  });

  const oauthAdminLink = await authService.handleOAuthLogin({
    provider: 'google',
    providerId: `admin_google_${testId}`,
    email: adminEmail,
    name: 'Admin Pre-existing',
  });
  record('Role Security', 'Existing admin role preserved upon OAuth login', oauthAdminLink.user.role === 'admin', `Admin role retained: ${oauthAdminLink.user.role}`);

  // 8. Normal email/password login behavior for OAuth-only accounts
  let caughtOauthAccountErr = false;
  try {
    await authService.login(oauthEmail, 'arbitraryPassword123');
  } catch (err) {
    if (err.code === 'OAUTH_ACCOUNT' || err.code === 'INVALID_CREDENTIALS') {
      caughtOauthAccountErr = true;
    }
  }
  record('Password Login Protection', 'OAuth-only account without password cannot be hijacked via password login', caughtOauthAccountErr, `Rejected password attempt`);

  // Cleanup test users
  await UserModel.deleteMany({ email: { $in: [oauthEmail, adminEmail] } });

  console.log('\n--- PHASE 6 OAUTH AUDIT SUMMARY ---');
  const allPassed = results.every(r => r.passed);
  console.log(`Total tests: ${results.length}, Passed: ${results.filter(r => r.passed).length}, Failed: ${results.filter(r => !r.passed).length}`);
  console.log(`OAuth Test Status: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
}

runOAuthTests().catch(console.error);
