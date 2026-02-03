/**
 * Test suite for TOTP/OTP library
 * Run with: node test/test.js
 */

const {
  generateSecret,
  generateQRCode,
  generateToken,
  verifyToken,
} = require('../dist/index.js');

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

let passed = 0;
let failed = 0;

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function assert(condition, testName) {
  if (condition) {
    log(`✓ ${testName}`, 'green');
    passed++;
  } else {
    log(`✗ ${testName}`, 'red');
    failed++;
  }
}

function assertEquals(actual, expected, testName) {
  assert(actual === expected, testName);
  if (actual !== expected) {
    log(`  Expected: ${expected}`, 'red');
    log(`  Actual: ${actual}`, 'red');
  }
}

function assertThrows(fn, testName) {
  try {
    fn();
    log(`✗ ${testName} - Expected to throw`, 'red');
    failed++;
  } catch (error) {
    log(`✓ ${testName}`, 'green');
    passed++;
  }
}

// Test Suite
log('\n🧪 TOTP/OTP Library Test Suite\n', 'cyan');

// Test 1: Generate Secret
log('Test Group 1: Secret Generation', 'blue');
try {
  const secretInfo = generateSecret({
    issuer: 'TestApp',
    accountName: 'test@example.com',
  });

  assert(typeof secretInfo.secret === 'string', 'Secret is a string');
  assert(secretInfo.secret.length >= 16, 'Secret has minimum length');
  assert(/^[A-Z2-7]+$/.test(secretInfo.secret), 'Secret is valid Base32');
  assert(secretInfo.issuer === 'TestApp', 'Issuer is correct');
  assert(
    secretInfo.accountName === 'test@example.com',
    'Account name is correct'
  );
  assert(
    secretInfo.otpAuthUrl.startsWith('otpauth://totp/'),
    'OTP Auth URL is valid'
  );
  assert(
    secretInfo.otpAuthUrl.includes(secretInfo.secret),
    'OTP Auth URL contains secret'
  );
} catch (error) {
  log(`✗ Secret generation failed: ${error.message}`, 'red');
  failed++;
}

// Test 2: Secret Generation with Custom Length
log('\nTest Group 2: Custom Secret Length', 'blue');
try {
  const secretInfo = generateSecret({
    issuer: 'TestApp',
    accountName: 'test@example.com',
    secretLength: 32,
  });

  assert(
    secretInfo.secret.length >= 32,
    'Secret with custom length is generated'
  );
} catch (error) {
  log(`✗ Custom secret length failed: ${error.message}`, 'red');
  failed++;
}

// Test 3: Secret Generation Error Handling
log('\nTest Group 3: Error Handling', 'blue');
assertThrows(() => {
  generateSecret({ issuer: '', accountName: 'test@example.com' });
}, 'Throws error when issuer is empty');

assertThrows(() => {
  generateSecret({ issuer: 'TestApp', accountName: '' });
}, 'Throws error when account name is empty');

// Test 4: QR Code Generation
log('\nTest Group 4: QR Code Generation', 'blue');
try {
  const secretInfo = generateSecret({
    issuer: 'TestApp',
    accountName: 'test@example.com',
  });

  const qrBase64 = generateQRCode(secretInfo.otpAuthUrl);
  assert(typeof qrBase64 === 'string', 'QR code Base64 is a string');
  assert(
    qrBase64.startsWith('data:image/svg+xml;base64,'),
    'QR code is Base64 data URL'
  );

  const qrSvg = generateQRCode(secretInfo.otpAuthUrl, 'svg');
  assert(typeof qrSvg === 'string', 'QR code SVG is a string');
  assert(qrSvg.startsWith('<svg'), 'QR code SVG starts with <svg');
  assert(qrSvg.includes('</svg>'), 'QR code SVG ends with </svg>');
} catch (error) {
  log(`✗ QR code generation failed: ${error.message}`, 'red');
  failed++;
}

// Test 5: Token Generation
log('\nTest Group 5: Token Generation', 'blue');
try {
  const secretInfo = generateSecret({
    issuer: 'TestApp',
    accountName: 'test@example.com',
  });

  const token = generateToken(secretInfo.secret);
  assert(typeof token === 'string', 'Token is a string');
  assertEquals(token.length, 6, 'Token has 6 digits');
  assert(/^\d{6}$/.test(token), 'Token contains only digits');
} catch (error) {
  log(`✗ Token generation failed: ${error.message}`, 'red');
  failed++;
}

// Test 6: Token Generation with Options
log('\nTest Group 6: Token Options', 'blue');
try {
  const secretInfo = generateSecret({
    issuer: 'TestApp',
    accountName: 'test@example.com',
  });

  const token8 = generateToken({
    secret: secretInfo.secret,
    digits: 8,
  });
  assertEquals(token8.length, 8, 'Token with 8 digits');

  const tokenSHA256 = generateToken({
    secret: secretInfo.secret,
    algorithm: 'SHA-256',
  });
  assert(typeof tokenSHA256 === 'string', 'Token with SHA-256');

  const tokenCustomStep = generateToken({
    secret: secretInfo.secret,
    step: 60,
  });
  assert(typeof tokenCustomStep === 'string', 'Token with custom step');
} catch (error) {
  log(`✗ Token options failed: ${error.message}`, 'red');
  failed++;
}

// Test 7: Token Verification
log('\nTest Group 7: Token Verification', 'blue');
try {
  const secretInfo = generateSecret({
    issuer: 'TestApp',
    accountName: 'test@example.com',
  });

  const token = generateToken(secretInfo.secret);
  const isValid = verifyToken(secretInfo.secret, token);
  assert(isValid === true, 'Valid token is accepted');

  const isInvalid = verifyToken(secretInfo.secret, '000000');
  assert(isInvalid === false, 'Invalid token is rejected');
} catch (error) {
  log(`✗ Token verification failed: ${error.message}`, 'red');
  failed++;
}

// Test 8: Token Verification with Time Window
log('\nTest Group 8: Time Window Verification', 'blue');
try {
  const secretInfo = generateSecret({
    issuer: 'TestApp',
    accountName: 'test@example.com',
  });

  // Use fixed timestamp - middle of a time window to avoid boundary issues
  const timestamp = 1609459215; // 15 seconds into a window

  // Generate token for past time window (-31 seconds = -2 steps)
  const pastToken = generateToken({
    secret: secretInfo.secret,
    timestamp: timestamp - 31,
  });

  // Should be valid with window = 1 (allows ±1 step = -1, 0, +1)
  const isValidWithWindow1 = verifyToken({
    secret: secretInfo.secret,
    token: pastToken,
    window: 1,
    timestamp: timestamp,
  });
  assert(isValidWithWindow1 === true, 'Token from -1 step valid with window = 1');

  // Should be invalid with window = 0 (only checks current step)
  const isInvalidNoWindow = verifyToken({
    secret: secretInfo.secret,
    token: pastToken,
    window: 0,
    timestamp: timestamp,
  });
  assert(isInvalidNoWindow === false, 'Token from -1 step invalid with window = 0');
} catch (error) {
  log(`✗ Time window verification failed: ${error.message}`, 'red');
  failed++;
}

// Test 9: Consistent Token Generation
log('\nTest Group 9: Token Consistency', 'blue');
try {
  const secretInfo = generateSecret({
    issuer: 'TestApp',
    accountName: 'test@example.com',
  });

  const timestamp = 1609459200; // Fixed timestamp: 2021-01-01 00:00:00 UTC

  const token1 = generateToken({
    secret: secretInfo.secret,
    timestamp: timestamp,
  });

  const token2 = generateToken({
    secret: secretInfo.secret,
    timestamp: timestamp,
  });

  assertEquals(token1, token2, 'Same timestamp generates same token');

  const token3 = generateToken({
    secret: secretInfo.secret,
    timestamp: timestamp + 30,
  });

  assert(token1 !== token3, 'Different timestamp generates different token');
} catch (error) {
  log(`✗ Token consistency failed: ${error.message}`, 'red');
  failed++;
}

// Test 10: RFC Test Vector (from RFC 6238)
log('\nTest Group 10: RFC 6238 Test Vectors', 'blue');
try {
  // RFC test vector: secret = "12345678901234567890" (Base32: "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ")
  const rfcSecret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';

  // Test vector for timestamp 59 (1970-01-01 00:00:59 UTC)
  const token59 = generateToken({
    secret: rfcSecret,
    timestamp: 59,
    algorithm: 'SHA-1',
  });
  assertEquals(token59, '287082', 'RFC test vector T=59 (SHA-1)');

  // Test vector for timestamp 1111111109
  const token1111111109 = generateToken({
    secret: rfcSecret,
    timestamp: 1111111109,
    algorithm: 'SHA-1',
  });
  assertEquals(
    token1111111109,
    '081804',
    'RFC test vector T=1111111109 (SHA-1)'
  );
} catch (error) {
  log(`✗ RFC test vectors failed: ${error.message}`, 'red');
  failed++;
}

// Test 11: Security Tests
log('\nTest Group 11: Security', 'blue');
try {
  const secretInfo = generateSecret({
    issuer: 'TestApp',
    accountName: 'test@example.com',
  });

  // Test token with spaces (should be cleaned)
  const token = generateToken(secretInfo.secret);
  const tokenWithSpaces = token.slice(0, 3) + ' ' + token.slice(3);
  const isValid = verifyToken(secretInfo.secret, tokenWithSpaces);
  assert(isValid === true, 'Token with spaces is cleaned and verified');

  // Test token with dashes (should be cleaned)
  const tokenWithDashes = token.slice(0, 3) + '-' + token.slice(3);
  const isValidDashes = verifyToken(secretInfo.secret, tokenWithDashes);
  assert(isValidDashes === true, 'Token with dashes is cleaned and verified');
} catch (error) {
  log(`✗ Security tests failed: ${error.message}`, 'red');
  failed++;
}

// Test 12: Performance Test
log('\nTest Group 12: Performance', 'blue');
try {
  const secretInfo = generateSecret({
    issuer: 'TestApp',
    accountName: 'test@example.com',
  });

  const iterations = 1000;
  const start = Date.now();

  for (let i = 0; i < iterations; i++) {
    const token = generateToken(secretInfo.secret);
    verifyToken(secretInfo.secret, token);
  }

  const duration = Date.now() - start;
  const opsPerSecond = Math.round((iterations * 2) / (duration / 1000));

  log(
    `  Performance: ${opsPerSecond.toLocaleString()} ops/sec (${iterations} token gen + ${iterations} verify)`,
    'cyan'
  );
  assert(duration < 10000, 'Performance test completes in reasonable time');
} catch (error) {
  log(`✗ Performance test failed: ${error.message}`, 'red');
  failed++;
}

// Summary
log('\n' + '='.repeat(50), 'cyan');
log('Test Results:', 'cyan');
log(`✓ Passed: ${passed}`, 'green');
if (failed > 0) {
  log(`✗ Failed: ${failed}`, 'red');
}
log('='.repeat(50) + '\n', 'cyan');

if (failed === 0) {
  log('🎉 All tests passed!\n', 'green');
  process.exit(0);
} else {
  log('❌ Some tests failed!\n', 'red');
  process.exit(1);
}
