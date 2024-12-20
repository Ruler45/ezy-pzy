#!/usr/bin/env node

import { program } from "commander";
import { LocalStorage } from "node-localstorage";
import { searchConnect, connectionMessage } from "./index.js";
import { input, confirm } from "@inquirer/prompts";

global.localStorage = new LocalStorage("./storage");


program
  .version("0.0.1", "-v, --version", "Output the version number")
  .description("Welcome to Linkzy CLI");

// Subcommand to connect
program
  .command("connect")
  .description("Search people and send connection requests on LinkedIn")
  .action(async () => {
    let Limit = await input({
      message:
        "Enter the maximum number of connection invite you want to send.(Default:20):",
      type: "number",
    });

    if (!Limit) {
      console.log(
        "You have entered 0, so the default value of 20 will be used"
      );
      Limit = 20;
    }
    let Company = await input({
      message:
        "Enter the name of the company whose employees you want to send connection invites to(Example: Google):",
      type: "string",
    });
    if (!Company) {
      console.log(
        "Not entering a company name will send connection invites to people from random companies"
      );
      const answer = await confirm({
        message: "Do you want to continue?",
      });
      if (answer) {
        Company = "";
      } else {
        process.exit(0);
      }
    }
    const Role = await input({
      message:
        "Enter the role of the employees you want to connection request to(Example: Software Engineer):",
      type: "string",
    });
    if (!Role) {
      console.log(
        "Not entering a role will send connection requests to random employees from the company"
      );
      const answer = await confirm({
        message: "Do you want to continue?",
      });
      if (!answer) {
        process.exit(0);
      }
    }
    try {
      await searchConnect(Role, Company, Limit);
    } catch (err) {
      console.log("Something went wrong:", err.message);
    }
  });

// Subcommand to send messages
program
  .command("message")
  .description("Send messages to LinkedIn connections")
  .action(async () => {
    let Limit = await input({
      message:
        "Enter the maximum number of connection invite you want to send.(Default:5):",
      type: "number",
    });

    if (!Limit) {
      console.log(
        "You have entered 0, so the default value of 20 will be used"
      );
      Limit = 5;
    }
    let Company = await input({
      message:
        "Enter the name of the company whose employees you want to message(Example: Google):",
      type: "string",
    });
    if (!Company) {
      console.log(
        "Not entering a company name will send messages to all connections"
      );
      const answer = await confirm({
        message: "Do you want to continue?",
      });
      if (answer) {
        Company = "";
      } else {
        process.exit(0);
      }
    }
    try {
      await connectionMessage(Company, Limit);
    } catch (err) {
      console.log("Something went wrong:", err.message);
    }
  });

// Global options
program
  .option("--email <email>", "Email of the LinkedIn account")
  .option("--password <password>", "Password of the LinkedIn account")
  .option("--message <message>", "Message to send with the connection request");

// Check for no subcommands or options
if (!process.argv.slice(2).length) {
  console.log("Welcome to the Linkzy CLI");
  console.log("Type 'linkzy --help' for more information");
} else {
  program.parse(process.argv);
}
