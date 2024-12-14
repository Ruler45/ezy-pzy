import puppeteer from "puppeteer";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_DRIVER_PATH,
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
  await page.waitForNavigation();
  await new Promise((resolve) => setTimeout(resolve, 2000));

  await page.locator("aria/2nd").click();
  await page.waitForNavigation();
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const filterByCompany = async (Company) => {
    await page.locator("#searchFilter_currentCompany").click();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await page.locator("aria/Add a company").fill(Company);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await page.locator(".basic-typeahead__selectable").click();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await page.locator("aria/Apply current filter to show results").click();
    await page.waitForNavigation();
    await new Promise((resolve) => setTimeout(resolve, 2000));
  };

  await filterByCompany("ecell nit silchar");

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
      hasMore = await page.evaluate(async () => {
        window.scrollBy(0, window.innerHeight);
        const connectButtons = Array.from(
          document.querySelectorAll("button")
        ).filter((btn) => btn.innerText.trim() === "Connect");
        if (connectButtons.length > 0) {
          return true;
        } else {
          const next = document.querySelector(".artdeco-pagination__button--next");
          console.log(next);
          
          if (next) {
            console.log("Next button found.");
            next.click();
            await new Promise((resolve) => setTimeout(resolve, 4000));
            return true;
          }
          return false;
        }
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return resultsSent;
  };

  console.log(await sendInvites());

  // Close browser (optional for testing)
  // await browser.close();
})();
