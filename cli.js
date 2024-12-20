#!/usr/bin/env node

import { program } from "commander";
import { LocalStorage } from "node-localstorage";
import { searchConnect, connectionMessage } from "./index.js";

global.localStorage = new LocalStorage("./storage");

// Top-level default action
program
  .version("0.0.1", "-v, --version", "Output the version number")
  .description("Welcome to Linkzy CLI");

// Subcommand to connect
program
  .command("connect")
  .description("Search people and send connection requests on LinkedIn")
  .action(async () => {
    try {
      await searchConnect();
    } catch (err) {
      console.log("Something went wrong:", err.message);
    }
  });

// Subcommand to send messages
program
  .command("message")
  .description("Send messages to LinkedIn connections")
  .action(async () => {
    try {
      await connectionMessage();
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

// Parse command-line arguments
