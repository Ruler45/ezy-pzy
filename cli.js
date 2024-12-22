#!/usr/bin/env node

import { program } from "commander";
import { LocalStorage } from "node-localstorage";
import { searchConnect, connectionMessage } from "./index.js";
import { input, confirm, password } from "@inquirer/prompts";
import { exec } from "child_process";
import os from "node:os";

global.localStorage = new LocalStorage("./storage");

// main command
program
  .version("0.0.11", "-v, --version", "Output the version number")
  .description("Welcome to Linkedfy CLI").helpInformation = () => {
  return `
    Usage: linkedfy [options] [command]

    Welcome to Linkedfy CLI

    Options:
      -v, --version                   Output the version number
      -h, --help                      display help for command

    Commands:
      setup                           Setup the CLI tool post installation. Run this before using the tool(If it's not run automatically)
      config <key> [value]            Set the configuration for the CLI tool
      connect                         Search people and send connection requests on LinkedIn
      message                         Send messages to LinkedIn connections
      help [command]                  display help for command`;
};

// Subcommand to setup
program
  .command("setup")
  .description(
    "Setup the CLI tool post installation. Run this before using the tool(If it's not run automatically)"
  )
  .action(async () => {
    console.log("Welcome to Linkzy CLI!");
    console.log("Setting up your CLI tool...");

    console.log("Installing chrome driver...");
    exec(
      "npx puppeteer browsers install chrome",
      async (error, stdout, stderr) => {
        if (error) {
          console.error(`Error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`Stderr: ${stderr}`);
          return;
        }
        if(stdout){
          console.log("Success: Chrome driver installed!");
          if (os.platform() === "linux") {
            console.log("Installing chromium browser...");
            exec(
              "sudo apt-get install -y chromium-browser",
              (error, stdout, stderr) => {
                if (error) {
                  console.error(`Error: ${error.message}`);
                  return;
                }
                if (stderr) {
                  console.error(`Stderr: ${stderr}`);
                  return;
                }
                console.log("Success: Chromium browser installed!");
              }
            );
          }
  
          if (
            !localStorage.getItem("email") ||
            localStorage.getItem("email") === ""
          ) {
            const email = await input({
              message: "Enter the email of your LinkedIn account:",
              type: "string",
            });
            localStorage.setItem("email", email);
          }
  
          if (!localStorage.getItem("password")||
          localStorage.getItem("password") === "") {
            const linkedinPassword = await password({
              message: "Enter the password of your LinkedIn account:",
            });
            localStorage.setItem("password", linkedinPassword);
          }
  
          if (!localStorage.getItem("message")||
          localStorage.getItem("message") === "") {
            const message = await input({
              message:
                "Enter the path to Message.js file you want to send to your connection:",
              type: "string",
            });
  
            localStorage.setItem("message", message);
          }
          console.log(
            "Setup completed successfully. You're ready to use the CLI."
          );
        }
      }
    );
  });

// Subcommand to set configuration
program
  .command("config <key> [value]")
  .option("-h, --help", "display help for command")
  .description("Set the configuration for the CLI tool")
  .action((key, value) => {
    if (value === undefined || value === "") {
      if (key === "password") {
        console.log("Cannot reveal password for security reasons");
        process.exit(0);
      }
      const val = localStorage.getItem(key);
      console.log(
        val ? `Value for ${key}: ${val}` : `No value found for ${key}`
      );
      process.exit(0);
    }
    if (key !== "email" && key !== "password" && key !== "message") {
      console.log(
        "Invalid key. Please enter a valid key(email, password or message)"
      );
      process.exit(0);
    }
    localStorage.setItem(key, value);
  }).helpInformation = () => {
  return `
    Usage: linkedfy config <key> [value]

    Set the configuration for the CLI tool

    Keys:
      email: Enter the email of your LinkedIn account
      password: Enter the password of your LinkedIn account
      message: Enter the path to Message.js file you want to send to your connection
    
    Note: 
      - Use 'linkedfy config <key>' to get the value of the key
      - Use 'linkedfy config <key> <value>' to set the value of the key

    Options:
      -h, --help  display help for command`;
};

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
      process.exit(0);
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
        "You have entered 0, so the default value of 5 will be used"
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
      process.exit(0);
    }
  });

// Check for no subcommands or options
if (!process.argv.slice(2).length) {
  console.log("Welcome to the Linkedfy CLI");
  console.log("Type 'linkedfy --help' for more information");
} else {
  program.parse(process.argv);
}
