import { db } from "..";
import { eq } from "drizzle-orm";
import { users, feeds } from "../schema";

export async function createFeed(name: string, url: string, userId: string) {
  const [result] = await db.insert(feeds).values({ name: name, url: url, userId: userId }).returning();
  return result;
}

export async function getFeeds() {
  const feedsList = await db.select().from(feeds);
  return feedsList;
}

export async function getFeedByUrl(url: string) {
  const [feed] = await db.select().from(feeds).where(eq(feeds.url, url));
  return feed;
}

export async function getFeedById(id: string) {
  const [feed] = await db.select().from(feeds).where(eq(feeds.id, id));
  return feed;
}

