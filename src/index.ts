import { readConfig, setUser } from "./config.js";
import { commandsRegistry, CommandsRegistry, handlerLogin, registerCommand, runCommand } from "./command_handler.js";
import { argv } from "node:process";

function main() {

  registerCommand(commandsRegistry, "login", handlerLogin);
  const [, , cmdName, ...args] = process.argv;
  runCommand(commandsRegistry, cmdName, ...args);
}

main();