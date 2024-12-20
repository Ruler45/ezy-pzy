// scripts/postinstall.js

console.log("Welcome to Linkzy CLI!");
console.log("Setting up your CLI tool...");

import { exec } from "child_process";

console.log("Installing chrome driver...");
exec("npx browser chrome", (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log("Success: Chrome driver installed!");
});
console.log("Setup complete! You're ready to use the CLI.");
