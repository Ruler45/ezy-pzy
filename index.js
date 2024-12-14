import puppeteer from "puppeteer";
import dotenv from "dotenv";

dotenv.config();

console.log(process.env.LINKEDIN_EMAIL);

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: false,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 760 });

  // Navigate to LinkedIn login page
  await page.goto("https://linkedin.com/login");

  // Log in
  await page.locator("#username").fill(process.env.LINKEDIN_EMAIL);
  await page.locator("#password").fill(process.env.LINKEDIN_PASSWORD);

  const checkBtn = await page.$(".remember_me__opt_in");
  if (checkBtn) {
    await checkBtn.click();
  }

  const loginButton = await page.waitForSelector(
    ".login__form_action_container > button"
  );
  await loginButton.click();
  await page.waitForNavigation();

  // Search people
  const searchInput = await page.waitForSelector(
    ".search-global-typeahead__input"
  );
  await searchInput.click();
  await searchInput.type(""); // Add the term you want to search
  await page.keyboard.press("Enter");
  await page.waitForNavigation();

  // Filter for "People"
  const peopleFilterButton = await page.$$eval(".artdeco-pill", (btns) => {
    const btn = btns.find((b) => b.innerText.trim() === "People");
    if (btn) {
      btn.click();
    }
  });

  await new Promise((resolve) => setTimeout(resolve, 2000)); // Short delay for DOM update

  // Click on "Connect" buttons
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

  console.log(await sendInvites());

  // Close browser (optional for testing)
  // await browser.close();
})();
