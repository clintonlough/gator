import { db } from "..";
import { eq } from "drizzle-orm";
import { users } from "../schema";

export async function createUser(name: string) {
  const [result] = await db.insert(users).values({ name: name }).returning();
  return result;
}

export async function getUserByName(name: string) {
  const [user] = await db.select().from(users).where(eq(users.name, name));
  return user;
}

export async function getUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

export async function getUsers() {
  const usersList = await db.select().from(users);
  return usersList;
}

export async function resetDatabase() {
  await db.execute(`TRUNCATE TABLE feeds RESTART IDENTITY CASCADE`);
  await db.execute(`TRUNCATE TABLE users RESTART IDENTITY CASCADE`);
  await db.execute(`TRUNCATE TABLE feed_follows RESTART IDENTITY CASCADE`);
  await db.execute(`TRUNCATE TABLE posts RESTART IDENTITY CASCADE`);
  console.log("Deleted all records from the database");
}