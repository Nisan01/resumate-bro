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


export const jobReadinessEnum = pgEnum("job_readiness", [
  "beginner",
  "developing",
  "intermediate",
  "advanced",
  "job_ready",
]);


export const projectStatusEnum = pgEnum("project_status", [
  "active",
  "progress",
  "planning",
  "done",
]);


export const skillSourceEnum = pgEnum("skill_source", [
  "resume",
  "manual",
  "suggested",
]);
 
export const skillProficiencyEnum = pgEnum("skill_proficiency", [
  "none",
  "beginner",
  "intermediate",
  "advanced",
  "expert",
]);
 
export const skillStatusEnum = pgEnum("skill_status", [
  "learning",
  "learned",
  "interested",
  "ignored",
]);


// ============================================================
// 1. USERS
// ============================================================

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 150 }).notNull(),
  avatarUrl: text("avatar_url"),
  password: text("password"),

  targetRole: varchar("target_role", { length: 150 }).default("Software Engineer"),
targetIndustry: varchar("target_industry", { length: 150 })
  .default("software_engineering"),  


    totalSkillTokens: integer("total_skill_tokens").default(0),
    totalResumeTokens: integer("total_resume_tokens").default(0),

  
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
  totalTokensUsed: integer("total_tokens_used").default(0),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Core Fields
  name: varchar("name", { length: 150 }).notNull(),
  emoji: varchar("emoji", { length: 10 }).default("🚀"),
  status: projectStatusEnum("status").default("planning"),

  description: text("description"),

  // Arrays stored as JSON
  techTags: jsonb("tech_tags").$type<string[]>(), // ["React", "FastAPI"]
  steps: jsonb("steps").$type<string[]>(), // ["Step 1", "Step 2"]

  progress: integer("progress").default(0), // 0–100

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


export const userSkills = pgTable("user_skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  skillName: varchar("skill_name", { length: 150 }).notNull(),
  source: skillSourceEnum("source").notNull(),
  proficiency: skillProficiencyEnum("proficiency").default("none"),
  status: skillStatusEnum("status").default("interested"),
  notes: text("notes"),
  meta: jsonb("meta"), 

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


// ============================================================
// 2. RELATIONS
// ============================================================

export const projectsRelations = relations(projects, ({ one }) => ({
  user: one(users, { fields: [projects.userId], references: [users.id] }),
}));



// ADD this new relation block:
export const userSkillsRelations = relations(userSkills, ({ one }) => ({
  user: one(users, { fields: [userSkills.userId], references: [users.id] }),
}));

// ============================================================
// 3. TYPE EXPORTS
// ============================================================

export type Project = typeof projects.$inferSelect;

// ============================================================
// RELATIONS
// ============================================================
export const usersRelations = relations(users, ({ many }) => ({
  resumes: many(resumes),
  userSkills: many(userSkills), // ADD THIS
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
export type UserSkill = typeof userSkills.$inferSelect;
export type NewUserSkill = typeof userSkills.$inferInsert;