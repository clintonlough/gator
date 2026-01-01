import { db } from "..";
import { eq, notBetween, sql } from "drizzle-orm";
import { posts, feeds } from "../schema";
import { url } from "node:inspector";

export async function createPost(title: string, url: string, feedId: string, description?: string, publishedAt?: Date | null ) {
    const [result] = await db.insert(posts).values({title: title, url: url, description: description, publishedAt: publishedAt, feedId: feedId}).returning();
    return result;
}

export async function getPostsForUser(user: string, numPosts: number) {
    const result = await db.execute(
        sql`
        SELECT *
        FROM posts p
        JOIN feed_follows ff
            ON p.feed_id = ff.feed_id
        WHERE ff.user_id = ${user}
        ORDER BY p.published_at DESC
        LIMIT ${numPosts}
        `
    );

    return result;
}

export async function getPostByUrl(CheckUrl: string) {
    const [result] = await db.select().from(posts).where(eq(posts.url, CheckUrl));
    return result;
}