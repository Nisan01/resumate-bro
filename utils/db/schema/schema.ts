import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  real,
  boolean,
  timestamp,
  jsonb,
  date,
  varchar,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================
// ENUMS  (must come first — tables depend on them)
// ============================================================

export const industryEnum = pgEnum("industry", [
  "software_engineering",
  "data_science",
  "cybersecurity",
  "cloud_devops",
  "product_management",
  "ui_ux_design",
  "ai_ml",
  "networking",
  "business_analysis",
  "other",
]);

export const jobReadinessEnum = pgEnum("job_readiness", [
  "beginner",
  "developing",
  "intermediate",
  "advanced",
  "job_ready",
]);

export const difficultyEnum = pgEnum("difficulty", [
  "easy",
  "medium",
  "hard",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "pending",
  "in_progress",
  "completed",
  "skipped",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "daily_reminder",
  "streak_alert",
  "task_due",
  "badge_earned",
  "leaderboard_update",
  "skill_prediction",
  "course_suggestion",
]);

export const courseTypeEnum = pgEnum("course_type", [
  "free",
  "paid",
  "certification",
]);

export const interviewTypeEnum = pgEnum("interview_type", [
  "technical",
  "behavioral",
  "system_design",
  "hr",
  "mixed",
]);

// ============================================================
// 1. USERS
// ============================================================

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 150 }).notNull(),
  avatarUrl: text("avatar_url"),
  password: text("password").notNull(),

  targetRole: varchar("target_role", { length: 150 }),
  targetIndustry: industryEnum("target_industry"),
  experienceYears: integer("experience_years").default(0),
  isOnboarded: boolean("is_onboarded").default(false),

  xpPoints: integer("xp_points").default(0),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastActiveDate: date("last_active_date"),
  leaderboardAlias: varchar("leaderboard_alias", { length: 80 }),
  isLeaderboardVisible: boolean("is_leaderboard_visible").default(true),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================
// 2. RESUMES
// ============================================================

export const resumes = pgTable("resumes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type", { length: 100 }),
  isActive: boolean("is_active").default(true),

  resumeScore: real("resume_score"),
  jobReadiness: jobReadinessEnum("job_readiness"),
  atsScore: real("ats_score"),
  formattingScore: real("formatting_score"),
  contentScore: real("content_score"),
  keywordsScore: real("keywords_score"),

  extractedSkills: jsonb("extracted_skills"),
  extractedExperience: jsonb("extracted_experience"),
  extractedEducation: jsonb("extracted_education"),
  extractedProjects: jsonb("extracted_projects"),

  analysisStatus: varchar("analysis_status", { length: 50 }).default("pending"),
  analysisCompletedAt: timestamp("analysis_completed_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================
// 3. RESUME IMPROVEMENT SUGGESTIONS
// ============================================================

export const resumeSuggestions = pgTable("resume_suggestions", {
  id: uuid("id").primaryKey().defaultRandom(),
  resumeId: uuid("resume_id").notNull().references(() => resumes.id, { onDelete: "cascade" }),

  section: varchar("section", { length: 100 }),
  priority: varchar("priority", { length: 20 }).default("medium"),
  suggestion: text("suggestion").notNull(),
  exampleText: text("example_text"),
  isApplied: boolean("is_applied").default(false),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================
// 4. SKILL GAP ANALYSIS
// ============================================================

export const skillGapAnalysis = pgTable("skill_gap_analysis", {
  id: uuid("id").primaryKey().defaultRandom(),
  resumeId: uuid("resume_id").notNull().references(() => resumes.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  targetRole: varchar("target_role", { length: 150 }).notNull(),

  missingSkills: jsonb("missing_skills"),
  presentSkills: jsonb("present_skills"),
  overallGapScore: real("overall_gap_score"),
  aiSummary: text("ai_summary"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================
// 5. SKILLS & USER SKILLS
// ============================================================

export const skills = pgTable("skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 150 }).notNull().unique(),
  category: varchar("category", { length: 100 }),
  industry: industryEnum("industry"),
});

export const userSkills = pgTable("user_skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  skillId: uuid("skill_id").notNull().references(() => skills.id, { onDelete: "cascade" }),
  proficiencyLevel: integer("proficiency_level").default(1),
  isVerified: boolean("is_verified").default(false),
  source: varchar("source", { length: 80 }),
  addedAt: timestamp("added_at").defaultNow().notNull(),
}, (t) => ({
  uniqueUserSkill: uniqueIndex("user_skill_unique").on(t.userId, t.skillId),
}));

// ============================================================
// 6. SKILL PREDICTIONS
// ============================================================

export const skillPredictions = pgTable("skill_predictions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  targetRole: varchar("target_role", { length: 150 }),
  industry: industryEnum("industry"),

  predictedSkills: jsonb("predicted_skills"),
  trendInsights: text("trend_insights"),

  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

// ============================================================
// 7. JOB ROLE SUGGESTIONS
// ============================================================

export const jobRoleSuggestions = pgTable("job_role_suggestions", {
  id: uuid("id").primaryKey().defaultRandom(),
  resumeId: uuid("resume_id").notNull().references(() => resumes.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  roleTitle: varchar("role_title", { length: 150 }).notNull(),
  industry: industryEnum("industry"),
  matchScore: real("match_score"),
  salaryRangeMin: integer("salary_range_min"),
  salaryRangeMax: integer("salary_range_max"),
  currency: varchar("currency", { length: 10 }).default("USD"),
  demandLevel: varchar("demand_level", { length: 50 }),
  reasonForMatch: text("reason_for_match"),
  requiredSkills: jsonb("required_skills"),
  isSaved: boolean("is_saved").default(false),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================
// 8. CAREER ROADMAPS & ENROLLMENTS
// ============================================================

export const careerRoadmaps = pgTable("career_roadmaps", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 200 }).notNull(),
  industry: industryEnum("industry").notNull(),
  targetRole: varchar("target_role", { length: 150 }).notNull(),
  description: text("description"),
  estimatedMonths: integer("estimated_months"),
  steps: jsonb("steps").notNull(),
  isPublished: boolean("is_published").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userRoadmapEnrollments = pgTable("user_roadmap_enrollments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  roadmapId: uuid("roadmap_id").notNull().references(() => careerRoadmaps.id, { onDelete: "cascade" }),
  currentStep: integer("current_step").default(1),
  completedSteps: jsonb("completed_steps").default([]),
  progressPercent: real("progress_percent").default(0),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (t) => ({
  uniqueEnrollment: uniqueIndex("user_roadmap_unique").on(t.userId, t.roadmapId),
}));

// ============================================================
// 9. COURSES & PROGRESS
// ============================================================

export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 150 }),
  url: text("url"),
  thumbnailUrl: text("thumbnail_url"),
  type: courseTypeEnum("type").default("free"),
  durationHours: real("duration_hours"),
  difficultyLevel: difficultyEnum("difficulty_level"),
  skillsCovered: jsonb("skills_covered"),
  industry: industryEnum("industry"),
  rating: real("rating"),
  isCertification: boolean("is_certification").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userCourseProgress = pgTable("user_course_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 50 }).default("saved"),
  progressPercent: real("progress_percent").default(0),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
}, (t) => ({
  uniqueUserCourse: uniqueIndex("user_course_unique").on(t.userId, t.courseId),
}));

// ============================================================
// 10. DAILY PROGRESS
// ============================================================

export const dailyProgress = pgTable("daily_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),

  tasksCompleted: integer("tasks_completed").default(0),
  tasksTotal: integer("tasks_total").default(0),
  studyMinutes: integer("study_minutes").default(0),
  xpEarned: integer("xp_earned").default(0),
  streakDay: integer("streak_day").default(0),
  moodScore: integer("mood_score"),
  notes: text("notes"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  uniqueUserDate: uniqueIndex("user_date_unique").on(t.userId, t.date),
}));

// ============================================================
// 11. TASKS
// ============================================================

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  status: taskStatusEnum("status").default("pending"),
  priority: varchar("priority", { length: 20 }).default("medium"),

  dueDate: date("due_date"),
  reminderAt: timestamp("reminder_at"),
  completedAt: timestamp("completed_at"),
  xpReward: integer("xp_reward").default(10),

  isRecurring: boolean("is_recurring").default(false),
  recurringPattern: varchar("recurring_pattern", { length: 50 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================
// 12. HABIT PATTERNS
// ============================================================

export const habitPatterns = pgTable("habit_patterns", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  patternType: varchar("pattern_type", { length: 100 }).notNull(),
  detectedAt: timestamp("detected_at").defaultNow().notNull(),
  description: text("description"),
  suggestion: text("suggestion"),
  isAcknowledged: boolean("is_acknowledged").default(false),
  windowDays: integer("window_days"),
  dataSnapshot: jsonb("data_snapshot"),
});

// ============================================================
// 13. INTERVIEW SESSIONS & QUESTIONS
// ============================================================

export const interviewSessions = pgTable("interview_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  jobRole: varchar("job_role", { length: 150 }).notNull(),
  interviewType: interviewTypeEnum("interview_type").default("technical"),
  difficulty: difficultyEnum("difficulty").default("medium"),
  totalQuestions: integer("total_questions").default(0),
  completedQuestions: integer("completed_questions").default(0),
  averageScore: real("average_score"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const interviewQuestions = pgTable("interview_questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").notNull().references(() => interviewSessions.id, { onDelete: "cascade" }),

  question: text("question").notNull(),
  category: varchar("category", { length: 100 }),
  difficulty: difficultyEnum("difficulty"),
  sampleAnswer: text("sample_answer"),
  userAnswer: text("user_answer"),
  aiScore: real("ai_score"),
  aiFeedback: text("ai_feedback"),
  answeredAt: timestamp("answered_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================
// 14. LINKEDIN SUGGESTIONS
// ============================================================

export const linkedinSuggestions = pgTable("linkedin_suggestions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  linkedinUrl: text("linkedin_url"),
  overallScore: real("overall_score"),
  suggestions: jsonb("suggestions"),
  headlineIdea: text("headline_idea"),
  summaryIdea: text("summary_idea"),
  keywordsToAdd: jsonb("keywords_to_add"),
  isApplied: boolean("is_applied").default(false),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
});

// ============================================================
// 15. CHAT CONVERSATIONS & MESSAGES
// ============================================================

export const chatConversations = pgTable("chat_conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id").notNull().references(() => chatConversations.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).notNull(),
  content: text("content").notNull(),
  tokensUsed: integer("tokens_used"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  conversationIdx: index("chat_messages_conversation_idx").on(t.conversationId),
}));

// ============================================================
// 16. BADGES & USER BADGES
// ============================================================

export const badges = pgTable("badges", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 150 }).notNull().unique(),
  description: text("description"),
  iconUrl: text("icon_url"),
  xpValue: integer("xp_value").default(50),
  condition: jsonb("condition"),
  tier: varchar("tier", { length: 30 }).default("bronze"),
});

export const userBadges = pgTable("user_badges", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  badgeId: uuid("badge_id").notNull().references(() => badges.id, { onDelete: "cascade" }),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
}, (t) => ({
  uniqueUserBadge: uniqueIndex("user_badge_unique").on(t.userId, t.badgeId),
}));

// ============================================================
// 17. LEADERBOARD SNAPSHOTS
// ============================================================

export const leaderboardSnapshots = pgTable("leaderboard_snapshots", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  alias: varchar("alias", { length: 80 }).notNull(),
  xpPoints: integer("xp_points").notNull(),
  rank: integer("rank"),
  badgeCount: integer("badge_count").default(0),
  streakDays: integer("streak_days").default(0),
  industry: industryEnum("industry"),
  snapshotDate: date("snapshot_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  leaderboardDateIdx: index("leaderboard_date_idx").on(t.snapshotDate),
}));

// ============================================================
// 18. NOTIFICATIONS
// ============================================================

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  metadata: jsonb("metadata"),
  isRead: boolean("is_read").default(false),
  scheduledAt: timestamp("scheduled_at"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  userNotificationIdx: index("user_notification_idx").on(t.userId, t.isRead),
}));

// ============================================================
// 19. NOTIFICATION PREFERENCES
// ============================================================

export const notificationPreferences = pgTable("notification_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),

  dailyReminderEnabled: boolean("daily_reminder_enabled").default(true),
  dailyReminderTime: varchar("daily_reminder_time", { length: 10 }).default("09:00"),
  streakAlertsEnabled: boolean("streak_alerts_enabled").default(true),
  leaderboardUpdatesEnabled: boolean("leaderboard_updates_enabled").default(true),
  courseRecommendationsEnabled: boolean("course_recommendations_enabled").default(true),
  skillPredictionsEnabled: boolean("skill_predictions_enabled").default(true),
  timezone: varchar("timezone", { length: 80 }).default("UTC"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================
// RELATIONS  (always AFTER all table declarations)
// ============================================================

export const usersRelations = relations(users, ({ many, one }) => ({
  resumes: many(resumes),
  userSkills: many(userSkills),
  chatConversations: many(chatConversations),
  dailyProgress: many(dailyProgress),
  tasks: many(tasks),
  userBadges: many(userBadges),
  notifications: many(notifications),
  notificationPreferences: one(notificationPreferences),
  jobRoleSuggestions: many(jobRoleSuggestions),
  skillPredictions: many(skillPredictions),
  interviewSessions: many(interviewSessions),
  linkedinSuggestions: many(linkedinSuggestions),
  roadmapEnrollments: many(userRoadmapEnrollments),
  habitPatterns: many(habitPatterns),
  leaderboardSnapshots: many(leaderboardSnapshots),
  skillGapAnalysis: many(skillGapAnalysis),
}));

export const resumesRelations = relations(resumes, ({ one, many }) => ({
  user: one(users, { fields: [resumes.userId], references: [users.id] }),
  suggestions: many(resumeSuggestions),
  skillGapAnalysis: many(skillGapAnalysis),
  jobRoleSuggestions: many(jobRoleSuggestions),
}));

export const resumeSuggestionsRelations = relations(resumeSuggestions, ({ one }) => ({
  resume: one(resumes, { fields: [resumeSuggestions.resumeId], references: [resumes.id] }),
}));

export const skillGapAnalysisRelations = relations(skillGapAnalysis, ({ one }) => ({
  resume: one(resumes, { fields: [skillGapAnalysis.resumeId], references: [resumes.id] }),
  user: one(users, { fields: [skillGapAnalysis.userId], references: [users.id] }),
}));

export const skillsRelations = relations(skills, ({ many }) => ({
  userSkills: many(userSkills),
}));

export const userSkillsRelations = relations(userSkills, ({ one }) => ({
  user: one(users, { fields: [userSkills.userId], references: [users.id] }),
  skill: one(skills, { fields: [userSkills.skillId], references: [skills.id] }),
}));

export const skillPredictionsRelations = relations(skillPredictions, ({ one }) => ({
  user: one(users, { fields: [skillPredictions.userId], references: [users.id] }),
}));

export const jobRoleSuggestionsRelations = relations(jobRoleSuggestions, ({ one }) => ({
  resume: one(resumes, { fields: [jobRoleSuggestions.resumeId], references: [resumes.id] }),
  user: one(users, { fields: [jobRoleSuggestions.userId], references: [users.id] }),
}));

export const careerRoadmapsRelations = relations(careerRoadmaps, ({ many }) => ({
  enrollments: many(userRoadmapEnrollments),
}));

export const userRoadmapEnrollmentsRelations = relations(userRoadmapEnrollments, ({ one }) => ({
  user: one(users, { fields: [userRoadmapEnrollments.userId], references: [users.id] }),
  roadmap: one(careerRoadmaps, { fields: [userRoadmapEnrollments.roadmapId], references: [careerRoadmaps.id] }),
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  userProgress: many(userCourseProgress),
}));

export const userCourseProgressRelations = relations(userCourseProgress, ({ one }) => ({
  user: one(users, { fields: [userCourseProgress.userId], references: [users.id] }),
  course: one(courses, { fields: [userCourseProgress.courseId], references: [courses.id] }),
}));

export const dailyProgressRelations = relations(dailyProgress, ({ one }) => ({
  user: one(users, { fields: [dailyProgress.userId], references: [users.id] }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, { fields: [tasks.userId], references: [users.id] }),
}));

export const habitPatternsRelations = relations(habitPatterns, ({ one }) => ({
  user: one(users, { fields: [habitPatterns.userId], references: [users.id] }),
}));

export const interviewSessionsRelations = relations(interviewSessions, ({ one, many }) => ({
  user: one(users, { fields: [interviewSessions.userId], references: [users.id] }),
  questions: many(interviewQuestions),
}));

export const interviewQuestionsRelations = relations(interviewQuestions, ({ one }) => ({
  session: one(interviewSessions, { fields: [interviewQuestions.sessionId], references: [interviewSessions.id] }),
}));

export const linkedinSuggestionsRelations = relations(linkedinSuggestions, ({ one }) => ({
  user: one(users, { fields: [linkedinSuggestions.userId], references: [users.id] }),
}));

export const chatConversationsRelations = relations(chatConversations, ({ one, many }) => ({
  user: one(users, { fields: [chatConversations.userId], references: [users.id] }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  conversation: one(chatConversations, { fields: [chatMessages.conversationId], references: [chatConversations.id] }),
}));

export const badgesRelations = relations(badges, ({ many }) => ({
  userBadges: many(userBadges),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, { fields: [userBadges.userId], references: [users.id] }),
  badge: one(badges, { fields: [userBadges.badgeId], references: [badges.id] }),
}));

export const leaderboardSnapshotsRelations = relations(leaderboardSnapshots, ({ one }) => ({
  user: one(users, { fields: [leaderboardSnapshots.userId], references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, { fields: [notificationPreferences.userId], references: [users.id] }),
}));

// ============================================================
// TYPE EXPORTS
// ============================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Resume = typeof resumes.$inferSelect;
export type NewResume = typeof resumes.$inferInsert;

export type Skill = typeof skills.$inferSelect;
export type UserSkill = typeof userSkills.$inferSelect;
export type SkillGapAnalysis = typeof skillGapAnalysis.$inferSelect;
export type SkillPrediction = typeof skillPredictions.$inferSelect;

export type JobRoleSuggestion = typeof jobRoleSuggestions.$inferSelect;
export type CareerRoadmap = typeof careerRoadmaps.$inferSelect;
export type UserRoadmapEnrollment = typeof userRoadmapEnrollments.$inferSelect;

export type Course = typeof courses.$inferSelect;
export type UserCourseProgress = typeof userCourseProgress.$inferSelect;

export type DailyProgress = typeof dailyProgress.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type HabitPattern = typeof habitPatterns.$inferSelect;

export type InterviewSession = typeof interviewSessions.$inferSelect;
export type InterviewQuestion = typeof interviewQuestions.$inferSelect;

export type LinkedinSuggestion = typeof linkedinSuggestions.$inferSelect;
export type ChatConversation = typeof chatConversations.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type Badge = typeof badges.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;
export type LeaderboardSnapshot = typeof leaderboardSnapshots.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type NotificationPreference = typeof notificationPreferences.$inferSelect;