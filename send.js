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
  await loginButton.click();
  await page.waitForNavigation();
  //   await page.waitForNavigation();

  await new Promise((resolve) => setTimeout(resolve, 20000));
  // Step 2: Navigate to 2nd-degree connections
  const searchUrl =
    "https://www.linkedin.com/search/results/people/?network=%5B%22S%22%5D&origin=FACETED_SEARCH&page=2";
  await page.goto(searchUrl);
  await page.waitForSelector(".artdeco-card");

  // Step 3: Scroll and collect "Connect" buttons
  const sendInvites = async () => {
    const resultsSent = [];
    let hasMore = true;

    while (hasMore) {
      // Find and click "Connect" buttons
      const results = await page.evaluate(() => {
        const connectButtons = Array.from(
          document.querySelectorAll("button")
        ).filter((btn) => btn.innerText.trim() === "Connect");
        const results = [];
        connectButtons.map(async (btn) => {
          btn.click();
          await new Promise((resolve) => setTimeout(resolve, 2000));
          const sendNowButton = Array.from(
            document.querySelectorAll("button")
          ).filter((btn) => btn.innerText.trim() === "Send")[0];
          if (sendNowButton) {
            sendNowButton.click();
            await new Promise((resolve) => setTimeout(resolve, 2000));
            results.push("Invite sent.");
          } else {
            results.push("Send now button not found.");
          }
        });
        return results;
      });

      resultsSent.push(...results);

      // Scroll to load more results
      hasMore = await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
        const connectButtons = Array.from(
            document.querySelectorAll("button")
          ).filter((btn) => btn.innerText.trim() === "Connect");
        return connectButtons.length > 0;
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return resultsSent;
  };

  await sendInvites();

  //   await browser.close();
})();
