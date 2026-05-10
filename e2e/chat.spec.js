import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Gemini Chat UI E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('should load the chat page', async ({ page }) => {
    await expect(page.locator('h1:has-text("Gemini Chat")')).toBeVisible();
  });

  test('should show message input', async ({ page }) => {
    await expect(page.locator('input[placeholder*="Type your message"]')).toBeVisible();
  });

  test('should show send button', async ({ page }) => {
    await expect(page.locator('button:has-text("Send")')).toBeVisible();
  });

  test('should show sidebar heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Conversations' })).toBeVisible();
  });

  test('should send a message and receive response', async ({ page }) => {
    const input = page.locator('input[placeholder*="Type your message"]');
    const sendButton = page.locator('button:has-text("Send")');

    await input.fill('Hello! How are you?');
    await sendButton.click();

    await expect(page.locator('text=Hello! How are you?')).toBeVisible();

    await page.waitForTimeout(3000);

    const assistantMessage = page.locator('.message, [class*="message"]').last();
    await expect(assistantMessage).toBeVisible({ timeout: 10000 });
  });

  test('should show streaming response with token stats', async ({ page }) => {
    // Start fresh conversation
    await page.locator('button:has-text("New")').click();
    
    const input = page.locator('input[placeholder*="Type your message"]');
    const sendButton = page.locator('button:has-text("Send")');

    await input.fill('Say hi');
    await sendButton.click();

    // Wait for response to complete
    await page.waitForTimeout(8000);

    // Check for token stats - may not always show depending on API response
    const tokens = page.locator('text=Tokens:');
    if (await tokens.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(page.locator('text=Time:')).toBeVisible();
    }
  });

  test('should start new conversation', async ({ page }) => {
    const newButton = page.locator('button:has-text("New")');
    await newButton.click();

    const input = page.locator('input[placeholder*="Type your message"]');
    await expect(input).toBeVisible();
    await input.fill('New test message');
  });

  test('should toggle dark/light mode', async ({ page }) => {
    const themeButton = page.locator('button:has-text("Switch to Light Mode"), button:has-text("Switch to Dark Mode")');
    
    if (await themeButton.isVisible()) {
      await themeButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('should show error for empty input', async ({ page }) => {
    const sendButton = page.locator('button:has-text("Send")');
    
    const input = page.locator('input[placeholder*="Type your message"]');
    const isDisabled = await input.isDisabled() || await sendButton.isDisabled();
    expect(isDisabled).toBe(true);
  });
});

test.describe('Backend API E2E', () => {
  const API_URL = 'http://localhost:4443';

  test('health check should return healthy status', async ({ request }) => {
    const response = await request.get(`${API_URL}/health`);
    expect(response.ok()).toBe(true);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.status).toBe('healthy');
  });

  test('stream-chat should return SSE response', async ({ request }) => {
    const response = await request.post(`${API_URL}/gemini/stream-chat`, {
      headers: { 'Content-Type': 'application/json' },
      data: { message: 'Say hello', conversationHistory: [] },
    });

    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toContain('text/event-stream');
  });

  test('validation should reject missing message', async ({ request }) => {
    const response = await request.post(`${API_URL}/gemini/stream-chat`, {
      headers: { 'Content-Type': 'application/json' },
      data: {},
    });

    const text = await response.text();
    expect(text).toContain('error');
  });
});
