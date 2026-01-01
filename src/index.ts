import { readConfig, setUser } from "./config.js";
import { middlewareLoggedIn, commandsRegistry, CommandsRegistry, handlerAddFeed, handlerAggregate, handlerFollow, handlerFollowing, handlerGetFeeds, handlerLogin, handlerRegisterUser, handlerReset, handlerUsers, registerCommand, runCommand, handlerUnfollow, handlerBrowse } from "./command_handler.js";
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
  registerCommand(commandsRegistry, "addfeed", middlewareLoggedIn(handlerAddFeed));
  registerCommand(commandsRegistry, "feeds", handlerGetFeeds);
  registerCommand(commandsRegistry, "follow", middlewareLoggedIn(handlerFollow));
  registerCommand(commandsRegistry, "following", middlewareLoggedIn(handlerFollowing));
  registerCommand(commandsRegistry, "unfollow", middlewareLoggedIn(handlerUnfollow));
  registerCommand(commandsRegistry, "browse", middlewareLoggedIn(handlerBrowse));
}

main();