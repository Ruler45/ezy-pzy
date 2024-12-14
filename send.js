import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: false,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 760 });

  // Step 1: Log in
  await page.goto("https://linkedin.com/login");

  // Log in
  await page.locator("#username").fill("sahin*****.****@gmail.com");
  await page.locator("#password").fill("***********");

  const checkBtn = await page.$(".remember_me__opt_in");
  if (checkBtn) {
    await checkBtn.click();
  }

  const loginButton = await page.waitForSelector(
    ".login__form_action_container > button"
  );
  console.log(await loginButton.click());
  
  //   await browser.close();
})();
