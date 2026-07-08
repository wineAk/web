const { chromium } = require("playwright");
const path = require("path");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const filePath = path.join(__dirname, "select.html");
  await page.goto(`file:///${filePath.replace(/\\/g, "/")}`);
  const text = await page.locator("#result").innerText();
  console.log(text);
  const failed = text.includes("FAIL");
  await browser.close();
  process.exit(failed ? 1 : 0);
})();
