import { readConfig, setUser } from "./config.js";
import { commandsRegistry, CommandsRegistry, handlerAggregate, handlerLogin, handlerRegisterUser, handlerReset, handlerUsers, registerCommand, runCommand } from "./command_handler.js";
import { argv } from "node:process";

async function main() {

  registerCommands();
  const [, , cmdName, ...args] = process.argv;
  await runCommand(commandsRegistry, cmdName, ...args);
  process.exit(0);
}

function registerCommands() {
  registerCommand(commandsRegistry, "login", handlerLogin);
  registerCommand(commandsRegistry, "register", handlerRegisterUser);
  registerCommand(commandsRegistry, "reset", handlerReset);
  registerCommand(commandsRegistry, "users", handlerUsers);
  registerCommand(commandsRegistry, "agg", handlerAggregate);
}

main();