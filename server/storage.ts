import { db } from "./db";
import { sessions, type Session, type InsertSession } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getSession(id: string): Promise<Session | undefined>;
  updateSession(id: string, updates: Partial<Session>): Promise<Session>;
  createSession(session: InsertSession): Promise<Session>;
}

export class DatabaseStorage implements IStorage {
  async getSession(id: string): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.sessionId, id));
    return session;
  }

  async updateSession(id: string, updates: Partial<Session>): Promise<Session> {
    const [updated] = await db.update(sessions)
      .set(updates)
      .where(eq(sessions.sessionId, id))
      .returning();
    return updated;
  }

  async createSession(session: InsertSession): Promise<Session> {
    const [created] = await db.insert(sessions).values(session).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
