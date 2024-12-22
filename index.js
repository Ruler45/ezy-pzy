import puppeteer from "puppeteer";
// import dotenv from "dotenv";
// import generateMessage from "./Message.js";
import { LocalStorage } from "node-localstorage";
import { pathToFileURL } from "url";

global.localStorage = new LocalStorage("./storage");
// dotenv.config();

// check if the environment variables are set

const checkEnv = async () => {
  if (
    localStorage.getItem("email") == null &&
    localStorage.getItem("password") == null
  ) {
    console.log("Please set your linkedin email and password");
    process.exit(1);
  } else if (localStorage.getItem("email") == null) {
    console.log("Please set your linkedin email");
    process.exit(1);
  } else if (localStorage.getItem("password") == null) {
    console.log("Please set your linkedin password");
    process.exit(1);
  }
};

const checkMessagePath = async () => {
  if (localStorage.getItem("message") == null) {
    console.log("Please set the path of the Message.js file");
    process.exit(1);
  }
};

// Open browser and login
const openAndLogin = async (page) => {
  await page.setViewport({ width: 1080, height: 640 });

  await page.goto("https://linkedin.com/login");

  await page.locator("#username").fill(localStorage.email);
  await page.locator("#password").fill(localStorage.password);
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
};

// Company wise search and connect
const searchConnect = async (Role, Company, limit = 20) => {
  await checkEnv();
  // Calculate expected time
  const expectedTime = (45 + limit * 5) / 60;
  console.log("Sending messages. Please wait...");
  console.log(
    "Expected time required: ",
    expectedTime.toFixed(2),
    " minutes\n"
  );
  const start = new Date().getTime();
  // Open browser
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  // Login
  await openAndLogin(page);

  // Search people
  const searchInput = await page.waitForSelector(
    ".search-global-typeahead__input"
  );
  await searchInput.click();
  await searchInput.type(Role !== undefined ? Role : "");
  await page.keyboard.press("Enter");
  await page.waitForNavigation();

  // Filter for "People"
  const people = await page.$$eval(".artdeco-pill", (btns) => {
    const btn = btns.find((b) => b.innerText.trim() === "People");
    if (btn) {
      btn.click();
      return true;
    } else {
      console.log("People button not found");
      return false;
    }
  });
  if (!people) return console.log("People button not found");
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
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const filtered = await page.evaluate(() => {
      const filterButton = Array.from(document.querySelectorAll("button")).find(
        (btn) => btn.innerText === "Show results"
      );
      if (!filterButton) return false;
      filterButton && filterButton.click();
      return true;
    });
    if (!filtered) return console.log("Failed to filter by company");
    await new Promise((resolve) => setTimeout(resolve, 1500));
  };

  Company !== undefined && Company != "" && (await filterByCompany(Company));

  // Click on "Connect" buttons
  const sendInvites = async (limit) => {
    let InvitesSent = [];
    let hasMore = true;
    while (hasMore) {
      const buttons = await page.$$("button");
      const connectButtons = [];
      for (const button of buttons) {
        const text = await page.evaluate((el) => el.innerText, button);
        if (text.trim() === "Connect") {
          connectButtons.push(button);
        }
      }
      let i = 0;
      while (i < connectButtons.length) {
        // Ensure not already open
        await page.evaluate(async () => {
          const closeAlreadyOpen = document.querySelector(
            ".artdeco-modal__dismiss"
          );
          closeAlreadyOpen && closeAlreadyOpen.click();
          await new Promise((resolve) => setTimeout(resolve, 1000));
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await connectButtons[i].click();
        i++;
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const sentIndividually = await page.evaluate(async () => {
          const sendNowButton = Array.from(
            document.querySelectorAll("button")
          ).find((btn) => btn.innerText.trim() === "Send");

          await new Promise((resolve) => setTimeout(resolve, 1000));
          if (sendNowButton && !sendNowButton.disabled) {
            sendNowButton.click();
            await new Promise((resolve) => setTimeout(resolve, 2000));
            return true;
          } else {
            const closeBtn = document.querySelector(".artdeco-modal__dismiss");
            closeBtn && closeBtn.click();
            return false;
          }
        });
        InvitesSent.push(sentIndividually ? "1" : "0");
        if (InvitesSent.length % 5 === 0)
          console.log(
            "............ ",
            (InvitesSent.length / limit) * 100,
            "% completed"
          );

        // Break if limit reached
        if (limit && InvitesSent.length >= limit) return InvitesSent;
      }

      hasMore = await page.evaluate(async () => {
        window.scrollTo(0, window.innerHeight + 1000);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const next = Array.from(document.querySelectorAll("button")).find(
          (btn) => btn.innerText.trim() === "Next"
        );
        if (next && !next.disabled) {
          next.click();
          await new Promise((resolve) => setTimeout(resolve, 4000));
          return true;
        } else {
          return false;
        }
      });
    }
    return InvitesSent;
  };
  const inviteResult = await sendInvites(limit);
  const inviteCount = inviteResult.filter((ele) => ele === "1").length;
  console.log(
    "Invites sent to ",
    inviteCount,
    "people",
    "out of",
    inviteResult.length
  );
  // close the browser
  await browser.close();
  const end = new Date().getTime();
  console.log(
    "Time taken: ",
    ((end - start) / (1000 * 60)).toFixed(2),
    " minutes"
  );
};

const connectionMessage = async (Company, limit = 20) => {
  // check if the environment variables are set
  await checkEnv();

  // check if the path of the Message.js file is set
  await checkMessagePath();

  // read the Message.js file
  const __filename = pathToFileURL("D:/Projects/Puppeteer/ezy-pzy/Message.js");
  if (!__filename) {
    console.log("Message.js file not found");
    process.exit(1);
  }
  const { default: generateMessage } = await import(__filename.href);
  if (typeof generateMessage !== "function") {
    console.log("Message.js file should export a function");
    process.exit(1);
  }

  // Calculate expected time
  const randomMessage = generateMessage("Sir/Madam");
  const expectedTime =
    (Math.round(randomMessage.length / 1166) / 2) * limit + 1.5;
  console.log("Sending messages. Please wait...");
  console.log("Expected time required: ", expectedTime, " minutes\n");
  const start = new Date().getTime();

  // Open browser
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  // Login
  await openAndLogin(page);

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
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const filtered = await page.evaluate(() => {
      const filterButton = Array.from(document.querySelectorAll("button")).find(
        (btn) => btn.innerText === "Show results"
      );
      if (!filterButton) return false;
      filterButton && filterButton.click();
      return true;
    });
    if (!filtered) return console.log("Failed to filter by company");
    await new Promise((resolve) => setTimeout(resolve, 1500));
  };

  Company !== undefined && Company != "" && (await filterByCompany(Company));

  const sendMessage = async (limit) => {
    await page.exposeFunction("moveMouse", async (x, y) => {
      let name = "";
      try {
        name = await page.$eval(
          ".artdeco-entity-lockup__title",
          (el) => el?.innerText
        );
      } catch (e) {
        // console.log(e);
      }

      if (!name) {
        try {
          name = await page.$eval(
            ".msg-overlay-bubble-header__title",
            (el) => el?.innerText
          );
        } catch (e) {
          // console.log(e);
          name = "Sir/Madam";
        }
      }
      const Message = generateMessage(name);
      const messageBox = await page.$(".msg-form__contenteditable");
      new Promise((resolve) => setTimeout(resolve, 1000));
      await messageBox.click();
      // await page.keyboard.type(".");
      // await new Promise((resolve) => setTimeout(resolve, 1000));
      // await page.keyboard.press("Backspace");
      await page.keyboard.type(Message);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });
    let hasMore = true;
    let messageSent = [];
    while (hasMore) {
      const buttons = await page.$$("button");
      const messageButtons = [];

      for (const button of buttons) {
        const text = await page.evaluate((el) => el.innerText, button);
        if (text.trim() === "Message") {
          messageButtons.push(button);
        }
      }
      let i = 0;
      // send message to indvidual people in the page
      while (i < messageButtons.length) {
        // Ensure not already open
        await page.evaluate(async () => {
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
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await messageButtons[i].click();
        i++;
        await new Promise((resolve) => setTimeout(resolve, 2000));
        try {
          const sentIndividually = await page.evaluate(
            async () => {
              const contentBox = document.querySelector(
                ".msg-form__contenteditable"
              );
              if (!contentBox) {
                console.log("Message box not found!");
                return false;
              }

              await window.moveMouse(100, 100);

              const sendNowButton = Array.from(
                document.querySelectorAll("button")
              ).find((btn) => btn.innerText.trim() === "Send");
              await new Promise((resolve) => setTimeout(resolve, 1000));

              let sent = true;
              if (sendNowButton && !sendNowButton.disabled) {
                sendNowButton.click();
                await new Promise((resolve) => setTimeout(resolve, 2000));
              } else {
                sent = false;
              }

              const closeBtn = Array.from(
                document.querySelectorAll(".artdeco-button__text")
              ).find((span) => span.innerText.includes("Close your"));
              if (closeBtn) {
                closeBtn.click();
                await new Promise((resolve) => setTimeout(resolve, 1000));
              }
              return sent;
            },
            { timeout: 120000 }
          );
          messageSent.push(sentIndividually ? "1" : "0");
          console.log(
            "............ ",
            (messageSent.length / limit) * 100,
            "% completed"
          );
        } catch (error) {
          messageSent.push("0");
          console.log(error);
        }

        // Break if limit reached
        if (limit && messageSent.length >= limit) return messageSent;
      }

      // Scroll to load more results
      hasMore = await page.evaluate(async () => {
        window.scrollTo(0, window.innerHeight + 1000);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const next = Array.from(document.querySelectorAll("button")).find(
          (btn) => btn.innerText.trim() === "Next"
        );
        if (next && !next.disabled) {
          next.click();
          await new Promise((resolve) => setTimeout(resolve, 1500));
          return true;
        } else {
          return false;
        }
      });
    }

    return messageSent;
  };

  const messageCount = await sendMessage(limit);
  const sendCount = messageCount.filter((ele) => ele === "1").length;
  console.log(
    "Message sent to ",
    sendCount,
    "people",
    "out of",
    messageCount.length
  );

  // close the browser
  await browser.close();
  const end = new Date().getTime();
  console.log(
    "Time taken: ",
    ((end - start) / (1000 * 60)).toFixed(2),
    " minutes"
  );
};

export { searchConnect, connectionMessage };
