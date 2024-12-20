#!/usr/bin/env node

import { program } from "commander";
import inquirer from "inquirer";
import { LocalStorage } from "node-localstorage";
import { searchConnect, connectionMessage } from "./index.js";

global.localStorage = new LocalStorage("./storage");

program
    .version("0.0.1")
    .action(()=>{
        console.log("Welcome to the CLI");
        console.log("Type 'linkzy --help' for more information");
        
    })

program
    .command("connect")
    .description("Command to search people and send connection request on linkedin")
    .action(async() => {
        await searchConnect();
    });

program
    .command("message")
    .description("To send message to connections")
    .action(async() => {
        await connectionMessage();
    });

program
    .option("--email, --email <email>", "Email of the linkedin account")
    .option("--password, --password <password>", "Password of the linkedin account")
    .option("--message, --message <message>", "Message to send with connection request")
    .action(async()=>{
        const options = program.opts();
        options.email &&  localStorage.setItem("LINKEDIN_EMAIL", options.email);
        options.password && localStorage.setItem("LINKEDIN_PASSWORD", options.password);
        options.message && localStorage.setItem("LINKEDIN_MESSAGE", options.message);
    });


program.parse(process.argv);
