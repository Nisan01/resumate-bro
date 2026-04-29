import { getDb } from "@/index";
import { resumes, resumeAnalyses } from "@/utils/db/schema/schema";

function computeOverallScore(aiData: any): number {

  const raw = [
    aiData?.contactInfo?.overall_score,
    aiData?.summary?.overall_score,
    aiData?.workExperience?.overall_score,
    aiData?.skills?.overall_score,
    aiData?.atsEvaluation?.overallATSScore,
    aiData?.certifications?.overall_score,
  ].filter((s): s is number => typeof s === "number");

  if (raw.length === 0) return 0;
  return Math.round((raw.reduce((a, b) => a + b, 0) / raw.length) * 10);
}

export const saveAiAnalysisResult = async (userId: string, aiData: any, totalTokensUsed: number,filename: string) => {
    const db = getDb();

  console.log("💾 Saving with tokens:", totalTokensUsed);

  const [newResume] = await db.insert(resumes).values({
    userId: userId,
    applicantName:
      aiData.contactInfo?.contact_fields?.find(
        (f: any) => f.label === "Full Name"
      )?.value || "Unknown",
    fileName: filename,
    fileUrl: "n/a",
    extractedSkills: aiData.skills?.skills ? aiData.skills : {},
    extractedProjects: Array.isArray(aiData.certifications?.projects)
      ? aiData.certifications.projects
      : [],
  }).returning();

  const [newAnalysis] = await db.insert(resumeAnalyses).values({
    resumeId: newResume.id,
    overallScore: computeOverallScore(aiData),                          // FIXED
    atsScore: aiData.atsEvaluation?.overallATSScore || 0,
    recruiterScore:
      aiData.recruiterEye?.recruiterVerdict?.overallSignal === "Strong" ? 9 : 5,
    jobReadiness: "developing",
    estimatedSeniority:
      aiData.recruiterEye?.recruiterVerdict?.estimatedSeniority || "Junior",
    suggestions: Array.isArray(aiData.summary?.suggestions)
      ? aiData.summary.suggestions
      : [],
    redFlags: Array.isArray(aiData.recruiterEye?.redFlags)
      ? aiData.recruiterEye.redFlags
      : [],
    highSignalSignals: Array.isArray(aiData.recruiterEye?.highSignalSignals)
      ? aiData.recruiterEye.highSignalSignals
      : [],
    rawJsonFeedback: aiData,
    totalTokensUsed: totalTokensUsed ?? 0,
  }).returning();

  return { resumeId: newResume.id, analysisId: newAnalysis.id };
};