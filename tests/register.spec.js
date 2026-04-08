const { test, expect } = require('@playwright/test');

// Generate unique email
const generateEmail = () => `user${Date.now()}@test.com`;

test.describe('Register Page Tests (Fixed)', () => {

test.beforeEach(async ({ page }) => {
await page.goto('http://localhost:3000/register');
});

// ✅ Positive Test
test('User registers successfully', async ({ page }) => {

```
await page.getByLabel('Full Name').fill('John Doe');
await page.getByLabel('Student ID').fill('CS123');
await page.getByLabel('Student Email').fill(generateEmail());

await page.locator('#faculty').selectOption('Computing');
await page.getByLabel('Course').fill('Software Engineering');
await page.locator('#year').selectOption('1');
await page.locator('#semester').selectOption('1');

await page.getByLabel('Password').fill('Password123');
await page.getByLabel('Confirm Password').fill('Password123');

await page.getByRole('button', { name: 'Create Account' }).click();

await expect(page.locator('text=Account created successfully')).toBeVisible();
```

});

// ❌ Invalid Email
test('Shows error for invalid email', async ({ page }) => {

```
await page.getByLabel('Full Name').fill('John Doe');
await page.getByLabel('Student ID').fill('CS123');
await page.getByLabel('Student Email').fill('invalid-email');

await page.getByRole('button', { name: 'Create Account' }).click();

await expect(page.locator('text=valid email')).toBeVisible();
```

});

// ❌ Password Mismatch
test('Shows error when passwords do not match', async ({ page }) => {

```
await page.getByLabel('Full Name').fill('John Doe');
await page.getByLabel('Student ID').fill('CS123');
await page.getByLabel('Student Email').fill(generateEmail());

await page.getByLabel('Password').fill('Password123');
await page.getByLabel('Confirm Password').fill('Wrong123');

await page.getByRole('button', { name: 'Create Account' }).click();

await expect(page.locator('text=Passwords do not match')).toBeVisible();
```

});

// ❌ Weak Password
test('Shows error for weak password', async ({ page }) => {

```
await page.getByLabel('Full Name').fill('John Doe');
await page.getByLabel('Student ID').fill('CS123');
await page.getByLabel('Student Email').fill(generateEmail());

await page.getByLabel('Password').fill('123');
await page.getByLabel('Confirm Password').fill('123');

await page.getByRole('button', { name: 'Create Account' }).click();

await expect(page.locator('text=Password must')).toBeVisible();
```

});

// ❌ Short Name
test('Shows error for short name', async ({ page }) => {

```
await page.getByLabel('Full Name').fill('Jo');
await page.getByRole('button', { name: 'Create Account' }).click();

await expect(page.locator('text=at least 3 characters')).toBeVisible();
```

});

// ❌ Invalid Student ID
test('Shows error for invalid student ID', async ({ page }) => {

```
await page.getByLabel('Full Name').fill('John Doe');
await page.getByLabel('Student ID').fill('!!');
await page.getByRole('button', { name: 'Create Account' }).click();

await expect(page.locator('text=Student ID must')).toBeVisible();
```

});

});
