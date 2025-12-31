import { db } from "..";
import { eq } from "drizzle-orm";
import { users, feeds, feedFollows } from "../schema";

export async function createFeedFollow(userId: string, feedId: string) {
    //insert record into the db
  const [newFeedFollow] = await db.insert(feedFollows).values({userId: userId, feedId: feedId }).returning();
  //join table with more data to return
  const [result] = await db.select({
    id: feedFollows.id,
    feedId: feedFollows.feedId,
    feedName: feeds.name,
    userId: feedFollows.userId,
    userName: users.name,
    createdAt: feedFollows.createdAt,
    updatedAt: feedFollows.updatedAt, 
    }).from(feedFollows)
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .innerJoin(users,eq(feedFollows.userId, users.id))
    .where(eq(feedFollows.id, newFeedFollow.id));

  return result;
}

export async function getFeedFollowsForUser(userId: string) {
    const result = await db.select().from(feedFollows).where(eq(feedFollows.userId,userId));
    return result;
}

export async function deleteFeedFollow(id: string) {
  await db.delete(feedFollows).where(eq(feedFollows.id,id));
}