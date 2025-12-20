import { error } from "node:console";
import { setUser } from "./config.js";

type CommandHandler = (cmdName: string, ...args: string[]) => void;

export type CommandsRegistry = Record<string, CommandHandler>;

export const commandsRegistry: CommandsRegistry = {
};

export function handlerLogin(cmdName: string, ...args: string[]){
    if (args.length === 0) {
        throw new Error("Please provide a valid argument");
    }
    setUser(args[0]);
    console.log(`User has been set to ${args[0]}`);
};

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
    commandsRegistry[cmdName] = handler;
};

export function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]) {
    const handler = registry[cmdName];
    if (!handler) {
        throw new Error("unknown command");
    }
    handler(cmdName, ...args);
};