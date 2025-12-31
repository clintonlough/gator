import { error } from "node:console";
import { setUser, getCurrentUser } from "./config.js";
import { createUser, getUserByName, getUsers, getUserById, resetUsers } from "./lib/db/queries/users.js";
import { createFeed, getFeeds, getFeedByUrl, getFeedById,getNextFeedToFetch, markFeedFetched } from "./lib/db/queries/feeds.js";
import { createFeedFollow, getFeedFollowsForUser, deleteFeedFollow } from "./lib/db/queries/feed_follows.js";
import { fetchFeed } from "./rss.js";
import { feeds, users, Feed, User } from "./lib/db/schema.js";

type UserCommandHandler = (cmdName: string, user: User, ...args: string[]) => Promise<void>;
type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
type middlewareLoggedIn = (handler: UserCommandHandler) => CommandHandler;


export type CommandsRegistry = Record<string, CommandHandler>;
export const commandsRegistry: CommandsRegistry = {
};

export function middlewareLoggedIn(handler: UserCommandHandler): CommandHandler {
    return async (cmdName: string, ...args: string[]): Promise<void> => { 
        const username = await getCurrentUser();
        if (!username) {
            throw new Error ("No user currently logged in");
        }
        const user = await getUserByName(username);
        if (!user) {
            throw new Error(`User ${username} not found`);
        }
        await handler(cmdName, user, ...args);
    };
}


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

export async function handlerAddFeed(cmdName: string, user: User, ...args: string[]) {
    const name = args[0];
    const url = args[1];

    if (!name || !url) {
        throw new Error("Please provide a name and url");
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

export async function handlerFollow(cmdName: string, user: User, ...args: string[]) {
    const url = args[0];
    if (!url) {
        throw new Error ("No URL Provided");
    }
    const feed = await getFeedByUrl(url);
    const newFeedFollow = await createFeedFollow(user.id, feed.id);
    console.log("New feed follow created");
    console.log(`User: ${newFeedFollow.userName}`);
    console.log(`Feed: ${newFeedFollow.feedName}`);
}

export async function handlerFollowing(cmdName: string, user: User, ...args: string[]) {
    const feeds = await getFeedFollowsForUser(user.id);
    console.log(`User ${user.name} following feeds:`);
    for (const feed of feeds) {
        let feedName = await getFeedById(feed.feedId);
        console.log(`- ${feedName.name}`);
    }
}

export async function handlerUnfollow(cmdName: string, user: User, ...args: string[]) {
    const feeds = await getFeedFollowsForUser(user.id);
    const url = args[0];
    if (!url) {
        throw new Error ("Please provide a url");
    }
    for (const feed of feeds) {
        let feedData = (await getFeedById(feed.feedId))
        let feedUrl = feedData.url;
        if (feedUrl === url) {
            await deleteFeedFollow(feed.id);
            console.log(`${feedData.name} unfollowed`);
            return;
        }
    }
    console.log("No feed follow found to delete");
}

export async function handlerAggregate(cmdName: string, ...args: string[]) {
    const timeBetweenReqs = args[0];
    const timeInterval = parseDuration(timeBetweenReqs);
    console.log(`Collecting feeds every ${timeBetweenReqs}`)

    scrapeFeeds().catch((err) => {
        console.error("Error while scraping feeds:", err);
    });

    const interval = setInterval(() => {
        scrapeFeeds().catch((err) => {
            console.error("Error while scraping feeds:", err);
    });
    }, timeInterval);

    await new Promise<void>((resolve) => {
        process.on("SIGINT", () => {
            console.log("Shutting down feed aggregator...");
        clearInterval(interval);
        resolve();
        });
    });
    
};

function parseDuration(durationStr: string): number {
    const regex = /^(\d+)(ms|s|m|h)$/;
    const match = durationStr.match(regex);
    console.log(match);

    if (!match) {
        throw new Error("Please provide a valid duration. E.g. 1h");
    }

    const amount = Number(match[1]); // "5" -> 5
    const unit = match[2];           // "m"

    switch (unit) {
        case "ms":
        return amount;
        case "s":
        return amount * 1000;
        case "m":
        return amount * 60 * 1000;
        case "h":
        return amount * 60 * 60 * 1000;
        default:
        throw new Error(`unsupported unit: ${unit}`);
    }
}

export async function scrapeFeeds() {
    const feed = await getNextFeedToFetch();
    const feedUrl = String(feed.url);
    console.log(`Fetching new posts from ${feed.name}:`);
    console.log("");
    const rssFeed = await fetchFeed(feedUrl);
    await markFeedFetched(String(feed.id));
    for (const post of rssFeed.channel.item) {
        console.log(post.title);
    }
    console.log("");
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