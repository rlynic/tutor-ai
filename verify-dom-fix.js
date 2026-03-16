const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const screenshotsDir = '/tmp/tutor-ai-screenshots';
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleMessages = [];
  const consoleErrors = [];

  page.on('console', (msg) => {
    const text = msg.text();
    consoleMessages.push(`[${msg.type()}] ${text}`);
    if (msg.type() === 'error') consoleErrors.push(text);
  });
  page.on('pageerror', (err) => {
    const msg = `PAGE ERROR: ${err.message}`;
    consoleErrors.push(msg);
    consoleMessages.push(`[pageerror] ${err.message}`);
  });

  // ── Step 1: Navigate ──────────────────────────────────────────────────────
  console.log('Step 1: Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000); // wait for React to hydrate
  console.log('Navigation complete. URL:', page.url());

  // ── Step 2: Initial screenshot ────────────────────────────────────────────
  console.log('Step 2: Taking initial screenshot...');
  await page.screenshot({ path: `${screenshotsDir}/1-initial.png`, fullPage: true });
  console.log('Screenshot saved: 1-initial.png');

  // ── Handle SetupWizard (5 steps: 欢迎, 选择服务商, 填写API Key, 选择模型, 完成) ──
  const wizardVisible = await page.locator('text=欢迎使用 TutorAI').count();
  if (wizardVisible > 0) {
    console.log('SetupWizard detected — clicking through all 5 steps...');

    // Step 0 → 1: 欢迎 page, click 下一步
    const next0 = page.locator('button', { hasText: '下一步' });
    if (await next0.count() > 0) {
      await next0.first().click();
      await page.waitForTimeout(400);
      console.log('  Wizard step 0 → 1 (欢迎 → 选择服务商)');
    }

    // Step 1 → 2: 选择服务商, click 下一步 (OpenAI is default)
    const next1 = page.locator('button', { hasText: '下一步' });
    if (await next1.count() > 0) {
      await next1.first().click();
      await page.waitForTimeout(400);
      console.log('  Wizard step 1 → 2 (选择服务商 → 填写 API Key)');
    }

    // Step 2 → 3: 填写 API Key — enter dummy key (wizard requires non-empty) then click 下一步
    const apiKeyInput = page.locator('input[type="password"]');
    if (await apiKeyInput.count() > 0) {
      await apiKeyInput.first().fill('sk-dummy-key-for-verification-test');
      await page.waitForTimeout(300);
      console.log('  Typed dummy API key into password input');
    }
    const next2 = page.locator('button', { hasText: '下一步' });
    if (await next2.count() > 0) {
      await next2.first().click();
      await page.waitForTimeout(400);
      console.log('  Wizard step 2 → 3 (填写 API Key → 选择模型)');
    }

    // Step 3 → 4: 选择模型, click 下一步
    const next3 = page.locator('button', { hasText: '下一步' });
    if (await next3.count() > 0) {
      await next3.first().click();
      await page.waitForTimeout(400);
      console.log('  Wizard step 3 → 4 (选择模型 → 完成)');
    }

    // Step 4: 完成 page — click "开始使用 🚀" button
    await page.screenshot({ path: `${screenshotsDir}/1b-wizard-final-step.png`, fullPage: true });
    const doneBtn = page.locator('button', { hasText: /开始使用|完成/ });
    const doneBtnCount = await doneBtn.count();
    console.log(`  Found ${doneBtnCount} "开始使用/完成" button(s)`);
    if (doneBtnCount > 0) {
      await doneBtn.first().click();
      await page.waitForTimeout(800);
      console.log('  Wizard completed — now on main UI!');
    } else {
      const allBtns = await page.$$eval('button', btns => btns.map(b => b.textContent?.trim()));
      console.log('  Buttons visible at final wizard step:', JSON.stringify(allBtns));
    }
  } else {
    console.log('No SetupWizard detected — app is already on main UI');
  }

  // Wait for main UI to settle
  await page.waitForTimeout(1000);

  // ── Step 3: Find textarea ─────────────────────────────────────────────────
  console.log('\nStep 3: Looking for textarea/input for math question...');
  const textarea = page.locator('textarea.question-input');
  const textareaCount = await textarea.count();
  const anyTextarea = page.locator('textarea');
  const anyCount = await anyTextarea.count();
  console.log(`textarea.question-input: ${textareaCount}  |  any textarea: ${anyCount}`);

  // ── Step 4: Type the question ─────────────────────────────────────────────
  const questionText = '一个长方形的长是8cm，宽是5cm，求面积';
  console.log(`Step 4: Typing question: "${questionText}"`);

  if (textareaCount > 0) {
    await textarea.first().click();
    await textarea.first().fill(questionText);
    console.log('Typed into textarea.question-input');
  } else if (anyCount > 0) {
    await anyTextarea.first().click();
    await anyTextarea.first().fill(questionText);
    console.log('Typed into first available textarea');
  } else {
    console.log('WARNING: No textarea found. Listing all visible buttons:');
    const btns = await page.$$eval('button', b => b.map(el => el.textContent?.trim()));
    console.log('Buttons:', JSON.stringify(btns));
  }

  await page.screenshot({ path: `${screenshotsDir}/2-after-typing.png`, fullPage: true });
  console.log('Screenshot saved: 2-after-typing.png');

  // ── Step 5: Find and click 开始讲解 ──────────────────────────────────────
  console.log('\nStep 5: Looking for 开始讲解 button...');
  const startBtn = page.locator('button', { hasText: /开始讲解/ });
  const startBtnCount = await startBtn.count();
  console.log(`Found ${startBtnCount} "开始讲解" button(s)`);

  if (startBtnCount > 0) {
    const isDisabled = await startBtn.first().isDisabled();
    console.log(`Button disabled: ${isDisabled}`);
    if (!isDisabled) {
      await startBtn.first().click();
      console.log('Clicked 开始讲解!');
    } else {
      console.log('WARNING: 开始讲解 button is disabled');
    }
  } else {
    const allBtns = await page.$$eval('button', b => b.map(el => el.textContent?.trim()));
    console.log('All buttons on page:', JSON.stringify(allBtns));
  }

  // ── Step 6: Wait for animation ────────────────────────────────────────────
  console.log('\nStep 6: Waiting 3 seconds for animation...');
  await page.waitForTimeout(3000);

  // ── Step 7: Post-animation screenshot ────────────────────────────────────
  console.log('Step 7: Taking post-animation screenshot...');
  await page.screenshot({ path: `${screenshotsDir}/3-after-animation.png`, fullPage: true });
  console.log('Screenshot saved: 3-after-animation.png');

  // ── Step 8: Check canvas ──────────────────────────────────────────────────
  console.log('\nStep 8: Checking for canvas element...');
  const canvasEls = await page.$$('canvas');
  console.log(`Canvas elements found: ${canvasEls.length}`);
  for (let i = 0; i < canvasEls.length; i++) {
    const box = await canvasEls[i].boundingBox();
    const id = await canvasEls[i].getAttribute('id') || '(no id)';
    const cls = await canvasEls[i].getAttribute('class') || '(no class)';
    console.log(`  canvas[${i}]: id="${id}" class="${cls}" box=${JSON.stringify(box)}`);
  }

  // Check canvas-area DOM structure
  const canvasArea = await page.$('.canvas-area');
  if (canvasArea) {
    const innerHTML = await canvasArea.innerHTML();
    console.log('\ncanvas-area innerHTML (first 600 chars):');
    console.log(innerHTML.substring(0, 600));
  }

  // Check dialog messages
  const msgs = await page.$$eval('.message-content', els => els.map(e => e.textContent?.trim()));
  if (msgs.length > 0) {
    console.log('\nDialog messages received:');
    msgs.forEach((m, i) => console.log(`  [${i}]: ${(m || '').substring(0, 120)}`));
  } else {
    console.log('\nNo .message-content elements found');
  }

  // ── Console Report ────────────────────────────────────────────────────────
  console.log('\n=== ALL CONSOLE MESSAGES ===');
  if (consoleMessages.length === 0) {
    console.log('(none)');
  } else {
    consoleMessages.forEach(m => console.log(m));
  }

  console.log('\n=== CONSOLE ERRORS ===');
  if (consoleErrors.length === 0) {
    console.log('(none — clean run!)');
  } else {
    consoleErrors.forEach(e => console.log('ERROR:', e));
  }

  const rcErrors = consoleErrors.filter(e =>
    e.toLowerCase().includes('removechild') ||
    e.toLowerCase().includes('not a child') ||
    e.toLowerCase().includes('notfounderror')
  );
  console.log('\n=== removeChild / NotFoundError CHECK ===');
  if (rcErrors.length === 0) {
    console.log('PASS: No removeChild / NotFoundError detected!');
  } else {
    console.log('FAIL: Errors found:');
    rcErrors.forEach(e => console.log(' -', e));
  }

  await browser.close();
  console.log('\nDone. Screenshots in:', screenshotsDir);
})();
