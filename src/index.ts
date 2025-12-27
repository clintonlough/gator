import { readConfig, setUser } from "./config.js";
import { commandsRegistry, CommandsRegistry, handlerAddFeed, handlerAggregate, handlerFollow, handlerFollowing, handlerGetFeeds, handlerLogin, handlerRegisterUser, handlerReset, handlerUsers, registerCommand, runCommand } from "./command_handler.js";
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
  registerCommand(commandsRegistry, "addfeed", handlerAddFeed);
  registerCommand(commandsRegistry, "feeds", handlerGetFeeds);
  registerCommand(commandsRegistry, "follow", handlerFollow);
  registerCommand(commandsRegistry, "following", handlerFollowing);
}

main();