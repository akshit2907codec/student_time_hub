import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getUserById,
  getDb,
  getAllSkills,
  getSkillsByCategory,
  getUserSkills,
  getGuildById,
  getUserGuilds,
  getPublicGuilds,
  getGuildMembers,
  getCoursesBySkill,
  getUserCourseEnrollments,
  getGuildTasks,
  getTaskAssignmentsForUser,
  getUserRewards,
  getGuildRewards,
  getUserAchievements,
  getGuildMessages,
  getGuildStudySessions,
  getUserNotifications,
  getTopUsers,
  getTopGuilds,
} from "./db";
import {
  users,
  guilds,
  guildMembers,
  skills,
  userSkills,
  courses,
  courseEnrollments,
  tasks,
  taskAssignments,
  rewards,
  notifications,
  leaderboardEntries,
  guildMessages,
  studySessions,
} from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,

  // ============ Authentication ============
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ User Profile ============
  user: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      return await getUserById(ctx.user.id);
    }),

    updateProfile: protectedProcedure
      .input(
        z.object({
          name: z.string().optional(),
          bio: z.string().optional(),
          avatar: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await db
          .update(users)
          .set({
            name: input.name,
            bio: input.bio,
            avatar: input.avatar,
          })
          .where(eq(users.id, ctx.user.id));

        return { success: true };
      }),

    getStats: protectedProcedure.query(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      const userSkillsList = await getUserSkills(ctx.user.id);
      const achievements = await getUserAchievements(ctx.user.id);
      const rewards = await getUserRewards(ctx.user.id);

      return {
        user,
        skillsCount: userSkillsList.length,
        achievementsCount: achievements.length,
        totalRewards: rewards.reduce((sum, r) => sum + r.points, 0),
      };
    }),
  }),

  // ============ Skills ============
  skills: router({
    getAll: publicProcedure.query(async () => {
      return await getAllSkills();
    }),

    getByCategory: publicProcedure
      .input(z.object({ category: z.string() }))
      .query(async ({ input }) => {
        return await getSkillsByCategory(input.category);
      }),

    getUserSkills: protectedProcedure.query(async ({ ctx }) => {
      return await getUserSkills(ctx.user.id);
    }),

    enrollSkill: protectedProcedure
      .input(z.object({ skillId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        // Check if already enrolled
        const existing = await db
          .select()
          .from(userSkills)
          .where(
            eq(userSkills.userId, ctx.user.id) &&
              eq(userSkills.skillId, input.skillId)
          );

        if (existing.length > 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Already enrolled in this skill",
          });
        }

        await db.insert(userSkills).values({
          userId: ctx.user.id,
          skillId: input.skillId,
          proficiency: "beginner",
          progress: 0,
        });

        return { success: true };
      }),
  }),

  // ============ Guilds ============
  guilds: router({
    getPublic: publicProcedure
      .input(z.object({ limit: z.number().default(20) }))
      .query(async ({ input }) => {
        return await getPublicGuilds(input.limit);
      }),

    getUserGuilds: protectedProcedure.query(async ({ ctx }) => {
      const result = await getUserGuilds(ctx.user.id);
      return result.map((r) => r.guilds);
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getGuildById(input.id);
      }),

    getMembers: publicProcedure
      .input(z.object({ guildId: z.number() }))
      .query(async ({ input }) => {
        return await getGuildMembers(input.guildId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1).max(100),
          description: z.string().optional(),
          primarySkill: z.number().optional(),
          isPublic: z.boolean().default(true),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const result = await db.insert(guilds).values({
          name: input.name,
          description: input.description,
          creatorId: ctx.user.id,
          primarySkill: input.primarySkill,
          isPublic: input.isPublic,
          memberCount: 1,
        });

        const guildId = Number((result as any).insertId);

        // Add creator as leader
        if (guildId && !isNaN(guildId)) {
          await db.insert(guildMembers).values({
            guildId: guildId,
            userId: ctx.user.id,
            role: "leader",
          });
        }

        return { id: guildId, success: true };
      }),

    join: protectedProcedure
      .input(z.object({ guildId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        // Check if already a member
        const existing = await db
          .select()
          .from(guildMembers)
          .where(
            eq(guildMembers.guildId, input.guildId) &&
              eq(guildMembers.userId, ctx.user.id)
          );

        if (existing.length > 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Already a member of this guild",
          });
        }

        await db.insert(guildMembers).values({
          guildId: input.guildId,
          userId: ctx.user.id,
          role: "member",
        });

        // Update guild member count
        const guild = await getGuildById(input.guildId);
        if (guild) {
          await db
            .update(guilds)
            .set({ memberCount: guild.memberCount + 1 })
            .where(eq(guilds.id, input.guildId));
        }

        return { success: true };
      }),

    leave: protectedProcedure
      .input(z.object({ guildId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await db
          .delete(guildMembers)
          .where(
            eq(guildMembers.guildId, input.guildId) &&
              eq(guildMembers.userId, ctx.user.id)
          );

        // Update guild member count
        const guild = await getGuildById(input.guildId);
        if (guild && guild.memberCount > 0) {
          await db
            .update(guilds)
            .set({ memberCount: guild.memberCount - 1 })
            .where(eq(guilds.id, input.guildId));
        }

        return { success: true };
      }),
  }),

  // ============ Courses ============
  courses: router({
    getBySkill: publicProcedure
      .input(z.object({ skillId: z.number() }))
      .query(async ({ input }) => {
        return await getCoursesBySkill(input.skillId);
      }),

    getUserEnrollments: protectedProcedure.query(async ({ ctx }) => {
      return await getUserCourseEnrollments(ctx.user.id);
    }),

    enroll: protectedProcedure
      .input(z.object({ courseId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        // Check if already enrolled
        const existing = await db
          .select()
          .from(courseEnrollments)
          .where(
            eq(courseEnrollments.userId, ctx.user.id) &&
              eq(courseEnrollments.courseId, input.courseId)
          );

        if (existing.length > 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Already enrolled in this course",
          });
        }

        await db.insert(courseEnrollments).values({
          userId: ctx.user.id,
          courseId: input.courseId,
          progress: 0,
        });

        // Update enrollment count
        const course = await db
          .select()
          .from(courses)
          .where(eq(courses.id, input.courseId))
          .limit(1);

        if (course.length > 0) {
          await db
            .update(courses)
            .set({ enrollmentCount: course[0].enrollmentCount + 1 })
            .where(eq(courses.id, input.courseId));
        }

        return { success: true };
      }),

    updateProgress: protectedProcedure
      .input(
        z.object({
          courseId: z.number(),
          progress: z.number().min(0).max(100),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const isCompleted = input.progress === 100;

        await db
          .update(courseEnrollments)
          .set({
            progress: input.progress,
            isCompleted,
            completedAt: isCompleted ? new Date() : null,
          })
          .where(
            eq(courseEnrollments.userId, ctx.user.id) &&
              eq(courseEnrollments.courseId, input.courseId)
          );

        return { success: true };
      }),
  }),

  // ============ Tasks ============
  tasks: router({
    getGuildTasks: publicProcedure
      .input(z.object({ guildId: z.number() }))
      .query(async ({ input }) => {
        return await getGuildTasks(input.guildId);
      }),

    getUserTasks: protectedProcedure.query(async ({ ctx }) => {
      return await getTaskAssignmentsForUser(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          guildId: z.number(),
          title: z.string(),
          description: z.string().optional(),
          dueDate: z.date().optional(),
          rewardPoints: z.number().default(10),
          difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        // Check if user is guild leader/moderator
        const membership = await db
          .select()
          .from(guildMembers)
          .where(
            eq(guildMembers.guildId, input.guildId) &&
              eq(guildMembers.userId, ctx.user.id)
          );

        if (
          membership.length === 0 ||
          (membership[0].role !== "leader" && membership[0].role !== "moderator")
        ) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only guild leaders/moderators can create tasks",
          });
        }

        const result = await db.insert(tasks).values({
          guildId: input.guildId,
          createdBy: ctx.user.id,
          title: input.title,
          description: input.description,
          dueDate: input.dueDate,
          rewardPoints: input.rewardPoints,
          difficulty: input.difficulty,
        });

        return { id: (result as any).insertId, success: true };
      }),

    assignToUser: protectedProcedure
      .input(
        z.object({
          taskId: z.number(),
          userId: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await db.insert(taskAssignments).values({
          taskId: input.taskId,
          userId: input.userId,
          status: "pending",
        });

        return { success: true };
      }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          assignmentId: z.number(),
          status: z.enum(["pending", "in_progress", "completed", "submitted"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const completedAt =
          input.status === "completed" ? new Date() : undefined;

        await db
          .update(taskAssignments)
          .set({
            status: input.status,
            completedAt,
          })
          .where(eq(taskAssignments.id, input.assignmentId));

        return { success: true };
      }),
  }),

  // ============ Rewards & Gamification ============
  rewards: router({
    getUserRewards: protectedProcedure.query(async ({ ctx }) => {
      return await getUserRewards(ctx.user.id);
    }),

    addReward: protectedProcedure
      .input(
        z.object({
          userId: z.number(),
          points: z.number(),
          reason: z.string(),
          guildId: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        // Add reward
        await db.insert(rewards).values({
          userId: input.userId,
          guildId: input.guildId,
          points: input.points,
          reason: input.reason,
        });

        // Update user total points
        const user = await getUserById(input.userId);
        if (user) {
          const newPoints = user.totalPoints + input.points;
          const newLevel = Math.floor(newPoints / 100) + 1;

          await db
            .update(users)
            .set({
              totalPoints: newPoints,
              level: newLevel,
              totalXP: user.totalXP + input.points,
            })
            .where(eq(users.id, input.userId));
        }

        // Update guild points if applicable
        if (input.guildId) {
          const guild = await getGuildById(input.guildId);
          if (guild) {
            const newGuildPoints = guild.totalPoints + input.points;
            const newGuildLevel = Math.floor(newGuildPoints / 500) + 1;

            await db
              .update(guilds)
              .set({
                totalPoints: newGuildPoints,
                level: newGuildLevel,
              })
              .where(eq(guilds.id, input.guildId));
          }
        }

        return { success: true };
      }),
  }),

  // ============ Leaderboard ============
  leaderboard: router({
    getTopUsers: publicProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input }) => {
        return await getTopUsers(input.limit);
      }),

    getTopGuilds: publicProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input }) => {
        return await getTopGuilds(input.limit);
      }),
  }),

  // ============ Guild Chat ============
  guildChat: router({
    getMessages: publicProcedure
      .input(z.object({ guildId: z.number(), limit: z.number().default(50) }))
      .query(async ({ input }) => {
        return await getGuildMessages(input.guildId, input.limit);
      }),

    sendMessage: protectedProcedure
      .input(
        z.object({
          guildId: z.number(),
          content: z.string().min(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const result = await db.insert(guildMessages).values({
          guildId: input.guildId,
          userId: ctx.user.id,
          content: input.content,
        });

        return { id: Number((result as any).insertId) || 0, success: true };
      }),
  }),

  // ============ Study Sessions ============
  studySessions: router({
    getGuildSessions: publicProcedure
      .input(z.object({ guildId: z.number() }))
      .query(async ({ input }) => {
        return await getGuildStudySessions(input.guildId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          guildId: z.number(),
          title: z.string(),
          description: z.string().optional(),
          scheduledAt: z.date(),
          duration: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const result = await db.insert(studySessions).values({
          guildId: input.guildId,
          createdBy: ctx.user.id,
          title: input.title,
          description: input.description,
          scheduledAt: input.scheduledAt,
          duration: input.duration,
        });

        return { id: (result as any).insertId, success: true };
      }),
  }),

  // ============ Notifications ============
  notifications: router({
    getUserNotifications: protectedProcedure
      .input(z.object({ limit: z.number().default(20) }))
      .query(async ({ ctx, input }) => {
        return await getUserNotifications(ctx.user.id, input.limit);
      }),

    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await db
          .update(notifications)
          .set({ isRead: true })
          .where(eq(notifications.id, input.notificationId));

        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
