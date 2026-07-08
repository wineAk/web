const { chromium } = require("playwright");
const path = require("path");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const filePath = path.join(__dirname, "file.html");
  await page.goto(`file:///${filePath.replace(/\\/g, "/")}`);
  await page.waitForFunction(() => window.__testsComplete === true, { timeout: 5000 });
  const text = await page.locator("#result").innerText();
  console.log(text);
  const failed = text.includes("FAIL");
  await browser.close();
  process.exit(failed ? 1 : 0);
})();
