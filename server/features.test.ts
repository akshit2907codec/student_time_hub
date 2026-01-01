import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock user context
function createMockContext(userId: number = 1, role: "user" | "admin" = "user"): TrpcContext {
  return {
    user: {
      id: userId,
      openId: `user-${userId}`,
      email: `user${userId}@example.com`,
      name: `Test User ${userId}`,
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Skills Router", () => {
  it("should get all skills", async () => {
    const caller = appRouter.createCaller(createMockContext());
    const skills = await caller.skills.getAll();
    expect(Array.isArray(skills)).toBe(true);
  });

  it("should get skills by category", async () => {
    const caller = appRouter.createCaller(createMockContext());
    const skills = await caller.skills.getByCategory({ category: "AI/ML" });
    expect(Array.isArray(skills)).toBe(true);
    if (skills.length > 0) {
      expect(skills[0].category).toBe("AI/ML");
    }
  });

  it("should enroll user in a skill", async () => {
    const caller = appRouter.createCaller(createMockContext(100));
    const skills = await caller.skills.getAll();
    
    if (skills.length > 1) {
      try {
        const result = await caller.skills.enrollSkill({ skillId: skills[1].id });
        expect(result.success).toBe(true);
      } catch (e) {
        // Already enrolled is acceptable in tests
        expect((e as any).message).toContain("Already enrolled");
      }
    }
  });

  it("should get user skills", async () => {
    const caller = appRouter.createCaller(createMockContext(1));
    const userSkills = await caller.skills.getUserSkills();
    expect(Array.isArray(userSkills)).toBe(true);
  });
});

describe("Guild Router", () => {
  it("should get public guilds", async () => {
    const caller = appRouter.createCaller(createMockContext());
    const guilds = await caller.guilds.getPublic({ limit: 10 });
    expect(Array.isArray(guilds)).toBe(true);
  });

  it("should create a new guild", async () => {
    const caller = appRouter.createCaller(createMockContext(2));
    const result = await caller.guilds.create({
      name: "Test Guild",
      description: "A test guild",
      isPublic: true,
    });
    expect(result.success).toBe(true);
    expect(result.id).toBeDefined();
  });

  it("should get guild members", async () => {
    const caller = appRouter.createCaller(createMockContext());
    const guilds = await caller.guilds.getPublic({ limit: 1 });
    
    if (guilds.length > 0) {
      const members = await caller.guilds.getMembers({ guildId: guilds[0].id });
      expect(Array.isArray(members)).toBe(true);
    }
  });

  it("should join a public guild", async () => {
    const caller = appRouter.createCaller(createMockContext(101));
    const guilds = await caller.guilds.getPublic({ limit: 1 });
    
    if (guilds.length > 0) {
      try {
        const result = await caller.guilds.join({ guildId: guilds[0].id });
        expect(result.success).toBe(true);
      } catch (e) {
        // Already a member is acceptable in tests
        expect((e as any).message).toContain("Already a member");
      }
    }
  });
});

describe("User Router", () => {
  it("should get user profile", async () => {
    const caller = appRouter.createCaller(createMockContext(1));
    const profile = await caller.user.getProfile();
    expect(profile).toBeDefined();
    expect(profile?.id).toBe(1);
  });

  it("should update user profile", async () => {
    const caller = appRouter.createCaller(createMockContext(1));
    const result = await caller.user.updateProfile({
      name: "Updated Name",
      bio: "Test bio",
    });
    expect(result.success).toBe(true);
  });

  it("should get user stats", async () => {
    const caller = appRouter.createCaller(createMockContext(1));
    const stats = await caller.user.getStats();
    expect(stats).toBeDefined();
    expect(stats?.user).toBeDefined();
    expect(typeof stats?.skillsCount).toBe("number");
    expect(typeof stats?.achievementsCount).toBe("number");
  });
});

describe("Rewards Router", () => {
  it("should get user rewards", async () => {
    const caller = appRouter.createCaller(createMockContext(1));
    const rewards = await caller.rewards.getUserRewards();
    expect(Array.isArray(rewards)).toBe(true);
  });

  it("should add reward to user", async () => {
    const caller = appRouter.createCaller(createMockContext(1));
    const result = await caller.rewards.addReward({
      userId: 1,
      points: 50,
      reason: "test_reward",
    });
    expect(result.success).toBe(true);
  });
});

describe("Leaderboard Router", () => {
  it("should get top users", async () => {
    const caller = appRouter.createCaller(createMockContext());
    const topUsers = await caller.leaderboard.getTopUsers({ limit: 10 });
    expect(Array.isArray(topUsers)).toBe(true);
  });

  it("should get top guilds", async () => {
    const caller = appRouter.createCaller(createMockContext());
    const topGuilds = await caller.leaderboard.getTopGuilds({ limit: 10 });
    expect(Array.isArray(topGuilds)).toBe(true);
  });
});

describe("Guild Chat Router", () => {
  it("should get guild messages", async () => {
    const caller = appRouter.createCaller(createMockContext());
    const guilds = await caller.guilds.getPublic({ limit: 1 });
    
    if (guilds.length > 0) {
      const messages = await caller.guildChat.getMessages({
        guildId: guilds[0].id,
        limit: 50,
      });
      expect(Array.isArray(messages)).toBe(true);
    }
  });

  it("should send message to guild", async () => {
    const caller = appRouter.createCaller(createMockContext(6));
    const guilds = await caller.guilds.getPublic({ limit: 1 });
    
    if (guilds.length > 0) {
      const result = await caller.guildChat.sendMessage({
        guildId: guilds[0].id,
        content: "Test message",
      });
      expect(result.success).toBe(true);
      expect(typeof result.id).toBe("number");
    }
  });
});

describe("Tasks Router", () => {
  it("should get guild tasks", async () => {
    const caller = appRouter.createCaller(createMockContext());
    const guilds = await caller.guilds.getPublic({ limit: 1 });
    
    if (guilds.length > 0) {
      const tasks = await caller.tasks.getGuildTasks({ guildId: guilds[0].id });
      expect(Array.isArray(tasks)).toBe(true);
    }
  });

  it("should get user tasks", async () => {
    const caller = appRouter.createCaller(createMockContext(1));
    const tasks = await caller.tasks.getUserTasks();
    expect(Array.isArray(tasks)).toBe(true);
  });
});

describe("Notifications Router", () => {
  it("should get user notifications", async () => {
    const caller = appRouter.createCaller(createMockContext(1));
    const notifications = await caller.notifications.getUserNotifications({ limit: 20 });
    expect(Array.isArray(notifications)).toBe(true);
  });
});

describe("Study Sessions Router", () => {
  it("should get guild study sessions", async () => {
    const caller = appRouter.createCaller(createMockContext());
    const guilds = await caller.guilds.getPublic({ limit: 1 });
    
    if (guilds.length > 0) {
      const sessions = await caller.studySessions.getGuildSessions({
        guildId: guilds[0].id,
      });
      expect(Array.isArray(sessions)).toBe(true);
    }
  });
});

describe("Courses Router", () => {
  it("should get courses by skill", async () => {
    const caller = appRouter.createCaller(createMockContext());
    const skills = await caller.skills.getAll();
    
    if (skills.length > 0) {
      const courses = await caller.courses.getBySkill({ skillId: skills[0].id });
      expect(Array.isArray(courses)).toBe(true);
    }
  });

  it("should get user course enrollments", async () => {
    const caller = appRouter.createCaller(createMockContext(1));
    const enrollments = await caller.courses.getUserEnrollments();
    expect(Array.isArray(enrollments)).toBe(true);
  });
});

describe("Auth Router", () => {
  it("should get current user", async () => {
    const caller = appRouter.createCaller(createMockContext(1));
    const user = await caller.auth.me();
    expect(user).toBeDefined();
    expect(user?.id).toBe(1);
  });

  it("should logout user", async () => {
    const clearedCookies: any[] = [];
    const ctx = createMockContext(1);
    ctx.res.clearCookie = (name: string, options: any) => {
      clearedCookies.push({ name, options });
    };
    
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});
