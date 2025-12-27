import { error } from "node:console";
import { setUser, getCurrentUser } from "./config.js";
import { createUser, getUserByName, getUsers, getUserById, resetUsers } from "./lib/db/queries/users.js";
import { createFeed, getFeeds, getFeedByUrl, getFeedById } from "./lib/db/queries/feeds.js";
import { createFeedFollow, getFeedFollowsForUser } from "./lib/db/queries/feed_follows.js";
import { fetchFeed } from "./rss.js";
import { feeds } from "./lib/db/schema.js";

type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

export type Feed = typeof feeds.$inferSelect; // feeds is the table object in schema.ts
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

export async function handlerUsers(cmdName: string, ...args: string[]) {
    const usersList = await getUsers();
    const currentUser = await getCurrentUser();

    for (const user in usersList) {
      const username = usersList[user].name
      if (username === currentUser) {
        console.log(`* ${username} (current)`);
      } else {
        console.log(`* ${username}`);
      }
    }
}

export async function handlerAddFeed(cmdName: string, ...args: string[]) {
    const name = args[0];
    const url = args[1];
    const username = await getCurrentUser();
    const user = await getUserByName(username);

    if (!name || !url || !user) {
        throw new Error("Please provide a name and url, and ensure you are logged in");
    }

    const feed = await createFeed(name, url, user.id);
    const feedFollow = await createFeedFollow(user.id, feed.id);
    printFeed(feed, user);
}

function printFeed(feed: Feed, user: any) {
    console.log(`New feed created by user: ${user.name}`);
    console.log(feed);
}

export async function handlerGetFeeds() {
    const feeds = await getFeeds();
    for (const feed of feeds) {
        console.log(`Name: ${feed.name}`);
        console.log(`URL: ${feed.url}`)
        let user = await getUserById(feed.userId);
        console.log(`User: ${user.name}`); 
        console.log("");
    }
}

export async function handlerFollow(cmdName: string, ...args: string[]) {
    const url = args[0];
    if (!url) {
        throw new Error ("No URL Provided");
    }
    const feed = await getFeedByUrl(url);
    const username = await getCurrentUser()
    const user = await getUserByName(username);

    const newFeedFollow = await createFeedFollow(user.id, feed.id);
    console.log("New feed follow created");
    console.log(`User: ${newFeedFollow.userName}`);
    console.log(`Feed: ${newFeedFollow.feedName}`);
}

export async function handlerFollowing(cmdName: string, ...args: string[]) {
    const username = await getCurrentUser();
    const user = await getUserByName(username);
    const feeds = await getFeedFollowsForUser(user.id);
    console.log(`User ${user.name} following feeds:`);
    for (const feed of feeds) {
        let feedName = await getFeedById(feed.feedId);
        console.log(`- ${feedName.name}`);
    }
}

export async function handlerAggregate(cmdName: string, ...args: string[]) {
    const url = args[0];
    const rssFeed = await fetchFeed(url);
    console.log(JSON.stringify(rssFeed, null, 2));
};


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