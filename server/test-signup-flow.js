// Test signup flow with validation
const API_BASE = 'http://localhost:5001/api';

// ANSI colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  test: (title) => console.log(`\n${colors.cyan}📋 TEST: ${title}${colors.reset}`),
  pass: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  fail: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
};

const testResults = {
  passed: 0,
  failed: 0
};

async function testSignupFlow() {
  try {
    console.log(`\n${colors.cyan}===== SIGNUP FLOW TEST SUITE =====${colors.reset}`);
    console.log(`Testing signup with validation order:`);
    console.log(`1. ✅ CHECK PendingStudent (approved list)`);
    console.log(`2. ✅ Verify email match`);
    console.log(`3. ✅ Verify course match`);
    console.log(`4. ✅ CHECK User table (duplicate prevention)`);
    console.log(`5. ✅ CHECK email duplicate in User table\n`);

    // Test 1: Student not in approved list
    log.test('CS999 - Not in PendingStudent (approved list)');
    log.info('Expected: STUDENT_NOT_FOUND error at CHECK 1');
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          u_name: 'Test Student 999',
          u_regno: 'CS999',
          u_email: 'cs999@example.com',
          u_course: 'Computer Science',
          u_year: 2,
          u_semester: 4,
          u_faculty: 'Engineering',
          u_password: 'Password@123'
        })
      });
      const data = await res.json();
      if (res.status === 403 && data.code === 'STUDENT_NOT_FOUND') {
        log.pass(`Correctly blocked: "${data.message}"`);
        log.info(`Status: ${res.status} | Code: ${data.code}`);
        testResults.passed++;
      } else {
        log.fail(`Wrong response: Status ${res.status}, Code ${data.code}`);
        testResults.failed++;
      }
    } catch (err) {
      log.fail(`Request error: ${err.message}`);
      testResults.failed++;
    }

    // Test 2: Email mismatch with pending data
    log.test('CS006 - Email mismatch with PendingStudent record');
    log.info('Expected: EMAIL_MISMATCH error at CHECK 2');
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          u_name: 'Test Student 006',
          u_regno: 'CS006',
          u_email: 'wrong@example.com', // Wrong email
          u_course: 'Computer Science',
          u_year: 2,
          u_semester: 4,
          u_faculty: 'Engineering',
          u_password: 'Password@123'
        })
      });
      const data = await res.json();
      if (res.status === 403 && data.code === 'EMAIL_MISMATCH') {
        log.pass(`Correctly blocked: "${data.message}"`);
        log.info(`Status: ${res.status} | Correct email: ${data.correctEmail}`);
        testResults.passed++;
      } else {
        log.fail(`Wrong response: Status ${res.status}, Code ${data.code}`);
        testResults.failed++;
      }
    } catch (err) {
      log.fail(`Request error: ${err.message}`);
      testResults.failed++;
    }

    // Test 3: Account already exists (duplicate signup attempt)
    log.test('CS005 - Account already exists (found in User table)');
    log.info('Expected: STUDENT_ID_EXISTS error at CHECK 4');
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          u_name: 'Test Student 005',
          u_regno: 'CS005',
          u_email: 'cs005@example.com',
          u_course: 'Computer Science',
          u_year: 2,
          u_semester: 4,
          u_faculty: 'Engineering',
          u_password: 'Password@123'
        })
      });
      const data = await res.json();
      if (res.status === 400 && data.code === 'STUDENT_ID_EXISTS') {
        log.pass(`Correctly blocked: "${data.message}"`);
        log.info(`Status: ${res.status} | Code: ${data.code}`);
        testResults.passed++;
      } else {
        log.fail(`Wrong response: Status ${res.status}, Code ${data.code}`);
        testResults.failed++;
      }
    } catch (err) {
      log.fail(`Request error: ${err.message}`);
      testResults.failed++;
    }

    // Test 4: Successful signup (CS007 if in pending list and not yet signed up)
    log.test('CS007 - Successful signup (should be in PendingStudent)');
    log.info('Expected: Account created, token returned');
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          u_name: 'Test Student 007',
          u_regno: 'CS007',
          u_email: 'cs007@example.com',
          u_course: 'Computer Science',
          u_year: 2,
          u_semester: 4,
          u_faculty: 'Engineering',
          u_password: 'Password@123'
        })
      });
      const data = await res.json();
      if (res.status === 201 && data.token) {
        log.pass(`Account created successfully!`);
        log.info(`Token: ${data.token.substring(0, 30)}...`);
        testResults.passed++;
      } else {
        log.fail(`Unexpected response: Status ${res.status}`);
        log.info(`Message: ${data.message}`);
        testResults.failed++;
      }
    } catch (err) {
      log.fail(`Request error: ${err.message}`);
      testResults.failed++;
    }

    // Summary
    console.log(`\n${colors.cyan}===== TEST SUMMARY =====${colors.reset}`);
    console.log(`${colors.green}✅ Passed: ${testResults.passed}${colors.reset}`);
    console.log(`${colors.red}❌ Failed: ${testResults.failed}${colors.reset}`);
    console.log(`Total Tests: ${testResults.passed + testResults.failed}\n`);

    if (testResults.failed === 0) {
      console.log(`${colors.green}🎉 All tests passed!${colors.reset}\n`);
    } else {
      console.log(`${colors.red}⚠️  Some tests failed. Review above.${colors.reset}\n`);
    }

    process.exit(testResults.failed === 0 ? 0 : 1);

  } catch (error) {
    console.error(`${colors.red}Test suite error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run tests
testSignupFlow();
