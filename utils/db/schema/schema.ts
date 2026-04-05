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
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================
// ENUMS
// ============================================================

export const industryEnum = pgEnum("industry", [
  "software_engineering",
  "data_science",
  "cybersecurity",
  "cloud_devops",
  "ai_ml",
  "other",
]);

export const jobReadinessEnum = pgEnum("job_readiness", [
  "beginner",
  "developing",
  "intermediate",
  "advanced",
  "job_ready",
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

  targetRole: varchar("target_role", { length: 150 }).default("Software Engineer"),
  targetIndustry: industryEnum("target_industry").default("software_engineering"),
  experienceYears: integer("experience_years").default(0),
  
  // Gamification & Tracking
  xpPoints: integer("xp_points").default(0),
  currentStreak: integer("current_streak").default(0),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================
// 2. RESUMES (The Storage)
// ============================================================

export const resumes = pgTable("resumes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  // Applicant Name extracted from Resume
  applicantName: varchar("applicant_name", { length: 150 }), 
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileUrl: text("file_url").notNull(),
  
  // Data snapshots from the JSON analysis
  extractedSkills: jsonb("extracted_skills"), // Store the raw skills found
  extractedProjects: jsonb("extracted_projects"), // Store the projects found
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================
// 3. RESUME ANALYSES (The Insights)
// ============================================================

export const resumeAnalyses = pgTable("resume_analyses", {
  id: uuid("id").primaryKey().defaultRandom(),
  resumeId: uuid("resume_id")
    .notNull()
    .references(() => resumes.id, { onDelete: "cascade" }),
  
  // Numerical Scores
  overallScore: real("overall_score").default(0),
  atsScore: real("ats_score").default(0),
  recruiterScore: real("recruiter_score").default(0),
  
  // Categorical Data
  jobReadiness: jobReadinessEnum("job_readiness"),
  estimatedSeniority: varchar("estimated_seniority", { length: 50 }), // e.g., "Junior"
  
  // Detailed Feedback (JSONB for complex objects)
  suggestions: jsonb("suggestions").$type<string[]>(), 
  redFlags: jsonb("red_flags"), // Store the issues/severity/fix objects
  highSignalSignals: jsonb("high_signal_signals"), // Store strengths
  
  rawJsonFeedback: jsonb("raw_json_feedback"), // The complete analysis blob
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================
// RELATIONS
// ============================================================

export const usersRelations = relations(users, ({ many }) => ({
  resumes: many(resumes),
}));

export const resumesRelations = relations(resumes, ({ one, many }) => ({
  user: one(users, { fields: [resumes.userId], references: [users.id] }),
  analyses: many(resumeAnalyses),
}));

export const resumeAnalysesRelations = relations(resumeAnalyses, ({ one }) => ({
  resume: one(resumes, { fields: [resumeAnalyses.resumeId], references: [resumes.id] }),
}));

// ============================================================
// TYPE EXPORTS
// ============================================================

export type User = typeof users.$inferSelect;
export type Resume = typeof resumes.$inferSelect;
export type ResumeAnalysis = typeof resumeAnalyses.$inferSelect;