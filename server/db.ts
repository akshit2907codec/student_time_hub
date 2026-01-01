import { eq, desc, and, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  skills,
  userSkills,
  guilds,
  guildMembers,
  courses,
  courseEnrollments,
  tasks,
  taskAssignments,
  rewards,
  achievements,
  userAchievements,
  guildMessages,
  studySessions,
  sessionParticipants,
  notifications,
  leaderboardEntries,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Skills
export async function getSkillById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(skills).where(eq(skills.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllSkills() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(skills);
}

export async function getSkillsByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(skills).where(eq(skills.category, category));
}

// User Skills
export async function getUserSkills(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(userSkills)
    .where(eq(userSkills.userId, userId));
}

// Guilds
export async function getGuildById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(guilds).where(eq(guilds.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserGuilds(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(guilds)
    .innerJoin(guildMembers, eq(guilds.id, guildMembers.guildId))
    .where(eq(guildMembers.userId, userId));
}

export async function getPublicGuilds(limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(guilds)
    .where(eq(guilds.isPublic, true))
    .orderBy(desc(guilds.totalPoints))
    .limit(limit);
}

export async function getGuildMembers(guildId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(guildMembers)
    .where(eq(guildMembers.guildId, guildId));
}

// Courses
export async function getCourseById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCoursesBySkill(skillId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(courses).where(eq(courses.skillId, skillId));
}

export async function getUserCourseEnrollments(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(courseEnrollments)
    .where(eq(courseEnrollments.userId, userId));
}

// Tasks
export async function getGuildTasks(guildId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(tasks)
    .where(eq(tasks.guildId, guildId))
    .orderBy(desc(tasks.createdAt));
}

export async function getTaskAssignmentsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(taskAssignments)
    .where(eq(taskAssignments.userId, userId));
}

// Rewards
export async function getUserRewards(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(rewards)
    .where(eq(rewards.userId, userId))
    .orderBy(desc(rewards.createdAt));
}

export async function getGuildRewards(guildId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(rewards)
    .where(eq(rewards.guildId, guildId))
    .orderBy(desc(rewards.createdAt));
}

// Achievements
export async function getUserAchievements(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(userAchievements)
    .where(eq(userAchievements.userId, userId));
}

// Guild Messages
export async function getGuildMessages(guildId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(guildMessages)
    .where(eq(guildMessages.guildId, guildId))
    .orderBy(desc(guildMessages.createdAt))
    .limit(limit);
}

// Study Sessions
export async function getGuildStudySessions(guildId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(studySessions)
    .where(eq(studySessions.guildId, guildId))
    .orderBy(desc(studySessions.scheduledAt));
}

// Notifications
export async function getUserNotifications(userId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

// Leaderboard
export async function getTopUsers(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(leaderboardEntries)
    .where(eq(leaderboardEntries.type, "user"))
    .orderBy(leaderboardEntries.rank)
    .limit(limit);
}

export async function getTopGuilds(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(leaderboardEntries)
    .where(eq(leaderboardEntries.type, "guild"))
    .orderBy(leaderboardEntries.rank)
    .limit(limit);
}
