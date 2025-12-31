import { db } from "..";
import { eq, notBetween } from "drizzle-orm";
import { users, feeds } from "../schema";
import { fetchFeed } from "src/rss";
import { timestamp } from "drizzle-orm/gel-core";
import { sql } from 'drizzle-orm'

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

export async function markFeedFetched(id:string) {
  const now = new Date();
  await db.update(feeds).set ({ 
    lastFetchedAt: now,
    updatedAt: now 
  })
  .where(eq(feeds.id, id));
}

export async function getNextFeedToFetch() {

  const feedsList =  await db.execute(
  sql`
    SELECT *
    FROM feeds
    ORDER BY last_fetched_at ASC NULLS FIRST
  `
);

  return feedsList[0];
}