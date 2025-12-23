import { error } from "node:console";
import { setUser } from "./config.js";
import { createUser, getUserByName, resetUsers } from "./lib/db/queries/users.js";

type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

export type CommandsRegistry = Record<string, CommandHandler>;

export const commandsRegistry: CommandsRegistry = {
};

export async function handlerLogin(cmdName: string, ...args: string[]){
    if (args.length === 0) {
        throw new Error("Please provide a valid argument");
    }

    const name = args[0];
    const user = await getUserByName(name);
    
    if(user === undefined){
        throw new Error("User not found");
    }
    setUser(args[0]);
    console.log(`User has been set to ${args[0]}`);
};

export async function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
    commandsRegistry[cmdName] = handler;
};

export async function handlerRegisterUser(cmdName: string, ...args: string[]){
    console.log("accessed register user function");
    if (args.length === 0) {
        throw new Error("Please provide a valid argument");
    }
    const name = args[0];
    if (await getUserByName(name)) {
        throw new Error("User already exists");
    }
    const user = await createUser(name);
    console.log("New user created:")
    console.log(user);
    await handlerLogin(cmdName, ...args);
}

export async function handlerReset(cmdName: string, ...args: string[]){
    await resetUsers();
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]) {
    const handler = registry[cmdName];
    if (!handler) {
        throw new Error("unknown command");
    }
    await handler(cmdName, ...args);
};