import puppeteer from "puppeteer";
import dotenv from "dotenv";
import generateMessage from "./Message.js";
dotenv.config();

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_DRIVER_PATH,
  headless: false,
});

const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 640 });

await page.goto("https://linkedin.com/login");

await page.locator("#username").fill(process.env.LINKEDIN_EMAIL);
await page.locator("#password").fill(process.env.LINKEDIN_PASSWORD);
// Don't select the "Remember me" checkbox orelse linkedin will flag you as a bot and ask for phone verification
const checkBtn = await page.$(".remember_me__opt_in");
if (checkBtn) {
  await checkBtn.click();
}

const loginButton = await page.waitForSelector(
  ".login__form_action_container > button"
);
await loginButton.click();
await loginButton.dispose();
await page.waitForNavigation();

// Company wise search and connect
const searchConnect = async (Role, Company) => {
  // Search people
  const searchInput = await page.waitForSelector(
    ".search-global-typeahead__input"
  );
  await searchInput.click();
  await searchInput.type(Role !== undefined ? Role : "");
  await page.keyboard.press("Enter");
  await page.waitForNavigation();

  // Filter for "People"
  await page.$$eval(".artdeco-pill", (btns) => {
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

  Company !== undefined && (await filterByCompany(Company));

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
            results.push("Invite sent.");
            await new Promise((resolve) => setTimeout(resolve, 2000));
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
          const next = document.querySelector(
            ".artdeco-pagination__button--next"
          );
          console.log(next);

          if (next) {
            // console.log("Next button found.");
            next.click();
            await new Promise((resolve) => setTimeout(resolve, 4000));
            return true;
          }
          return false;
        }
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return "Invites sent: " + resultsSent.length;
  };

  console.log(await sendInvites());

  // Close browser (optional for testing)
  // await browser.close();
};

const connectionMessage = async (Company) => {
  // Search people
  const searchInput = await page.waitForSelector(
    ".search-global-typeahead__input"
  );
  await searchInput.click();
  await searchInput.type("");
  await page.keyboard.press("Enter");
  await page.waitForNavigation();

  // Filter for "People"
  await page.$$eval(".artdeco-pill", (btns) => {
    const btn = btns.find((b) => b.innerText.trim() === "People");
    if (btn) {
      btn.click();
    }
  });
  await page.waitForNavigation();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  await page.locator("aria/1st").click();
  await page.waitForNavigation();
  await new Promise((resolve) => setTimeout(resolve, 1000));

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

  Company !== undefined && (await filterByCompany(Company));

  const sendMessage = async () => {
    await page.exposeFunction("moveMouse", async (x, y) => {
      let name = "";
      try {
        name = await page.$eval(
          ".artdeco-entity-lockup__title",
          (el) => el?.innerText
        );
      } catch (e) {
        console.log(e);
      }

      if (!name) {
        try {
          name = await page.$eval(
            ".msg-overlay-bubble-header__title",
            (el) => el?.innerText
          );
        } catch (e) {
          console.log(e);
          name = "Sir/Madam";
        }
      }
      const Message = generateMessage(name);
      await page.locator(".msg-form__contenteditable").click();
      await page.keyboard.type(Message);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    const messageSent = await page.evaluate(async () => {
      let result = [];
      let hasMore = true;

      while (hasMore) {
        const messageButtons = Array.from(
          document.querySelectorAll("button")
        ).filter((btn) => btn.innerText.trim() === "Message");

        for (let i = 0; i < messageButtons.length; i++) {
          // Ensure not already open
          const isOpen = !!document.querySelector(".msg-form__contenteditable");
          if (isOpen) {
            const closeBtn = Array.from(
              document.querySelectorAll(".artdeco-button__text")
            ).find((span) => span.innerText.includes("Close your"));
            if (closeBtn) {
              closeBtn.click();
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          }

          messageButtons[i].click();
          await new Promise((resolve) => setTimeout(resolve, 2000));

          const contentBox = document.querySelector(
            ".msg-form__contenteditable"
          );
          if (!contentBox) {
            console.log("Message box not found!");
            continue;
          }

          await window.moveMouse(100, 100);

          const sendNowButton = Array.from(
            document.querySelectorAll("button")
          ).find((btn) => btn.innerText.trim() === "Send");

          await new Promise((resolve) => setTimeout(resolve, 1000));
          if (sendNowButton) {
            sendNowButton.click();
            await new Promise((resolve) => setTimeout(resolve, 2000));
            result.push("1");
          } else {
            console.log("Send button not found!");
            result.push("0");
          }

          const closeBtn = Array.from(
            document.querySelectorAll(".artdeco-button__text")
          ).find((span) => span.innerText.includes("Close your"));
          if (closeBtn) {
            closeBtn.click();
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }

        // Scroll and navigate to the next page
        window.scrollTo(0, window.innerHeight + 1000);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const next = Array.from(document.querySelectorAll("button")).find(
          (btn) => btn.innerText.trim() === "Next"
        );
        if (next && !next.disabled) {
          next.click();
          await new Promise((resolve) => setTimeout(resolve, 1500));
        } else {
          hasMore = false;
        }
      }
      return result;
    });

    return messageSent;
  };

  const messageCount = await sendMessage();
  const sendCount = messageCount.filter((ele) => ele === "1").length;
  console.log(
    "Message sent to ",
    sendCount,
    "people",
    "out of",
    messageCount.length
  );
};

// searchConnect("Role","payu");

connectionMessage("Google Developer Groups On Campus, NIT Silchar");
