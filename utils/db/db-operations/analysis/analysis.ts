import { db } from "@/index";
import { resumes, resumeAnalyses } from "@/utils/db/schema/schema";

export const saveAiAnalysisResult = async (userId: string, aiData: any) => {
 
  const [newResume] = await db.insert(resumes).values({
    userId: userId,
    applicantName:
      aiData.contactInfo?.contact_fields?.find(
        (f: any) => f.label === "Full Name"
      )?.value || "Unknown",
    fileName: "Analyzed_Resume",
    fileUrl: "n/a",
    extractedSkills: aiData.skills || {},
    extractedProjects: aiData.certifications?.projects || [],
  }).returning();

  // 2. Insert the Analysis record
  const [newAnalysis] = await db.insert(resumeAnalyses).values({
    resumeId: newResume.id,
    overallScore: aiData.summary?.overall_score || 0,
    atsScore: aiData.atsEvaluation?.overallATSScore || 0,
    recruiterScore:
      aiData.recruiterEye?.recruiterVerdict?.overallSignal === "Strong"
        ? 9
        : 5,
    jobReadiness: "developing",
    estimatedSeniority:
      aiData.recruiterEye?.recruiterVerdict?.estimatedSeniority || "Junior",
    suggestions: aiData.summary?.suggestions || [],
    redFlags: aiData.recruiterEye?.redFlags || [],
    highSignalSignals: aiData.recruiterEye?.highSignalSignals || [],
    rawJsonFeedback: aiData,
  }).returning();

  return { resumeId: newResume.id, analysisId: newAnalysis.id };
};