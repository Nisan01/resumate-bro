"use client";

import { useState, useEffect, useRef } from "react";
import { Medal, Save } from "lucide-react";
import AnalysisResult from "./_components/analysis-result/AnalysisResult";
import ResumeHeroLeft from "./_components/resume-hero-left/ResumeHeroLeft";
import ResumeUploaderRight from "./_components/resume-hero-right/ResumeHeroRight";
import { toast } from "react-toastify";
import { useUser } from "@/context/UserContext";
import { saveResumeTokens } from "@/utils/db/db-operations/user-tokens/SaveTokens";

export default function Page() {
  const resultsRef = useRef<HTMLDivElement>(null);
  const [analysis, setAnalysis] = useState<Record<string, any>>({});
  const { user, loading } = useUser();

  const hasAnalysis = Object.keys(analysis).some(k => k !== "header");
  

const handleDone = async (analysisFromChild?: Record<string, any>) => {
    const currentAnalysis = analysisFromChild || analysis;
    const filename = currentAnalysis.filename;

    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    try {
      const response = await fetch("/api/resume/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis: currentAnalysis,
          userId: user?.id,
          filename: filename,
          totalTokensUsed: currentAnalysis.totalTokensUsed?.count ?? 0,
        }),
      });


      if(!loading){
        await fetch("/api/save-resume-tokens", {
          method: "POST",
          headers: { "Content-Type": "application/json" },    
          body: JSON.stringify({ userId: user?.id ,
              tokensUsed: currentAnalysis.totalTokensUsed?.count ?? 0
          }),
        });

     
      }

     
      if (response.ok) {
        toast.success("Analysis saved successfully!", {
          position: "bottom-right",
        });

        const skillsArray = currentAnalysis?.skills?.skills || [];
        if (skillsArray.length > 0 && user?.id) {
          const skillNames = skillsArray.map((s: any) => s.name);
          try {
            const syncRes = await fetch("/api/skills/from-resume", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: user.id,
                skills: skillNames
              }),
            });
            const syncResult = await syncRes.json();
            if (!syncRes.ok) {
              console.error("❌ Sync failed:", syncResult);
              toast.error("Failed to sync skills: " + (syncResult.error || "Unknown"));
            } else {
              console.log(`Saved ${syncResult.count} skills to tracker`);
            }
          } catch (err) {
            console.error("❌ Sync error:", err);
          }
        }
      }
    } catch (err) {
      toast.error("Failed to save to DB:", {
        position: "bottom-right",
      });
    }
  };
  
  useEffect(() => {
    if (hasAnalysis) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [hasAnalysis]);

  
  useEffect(() => {
    if (Object.keys(analysis).length > 0) {
      console.log("📊 Analysis update:", analysis);
    }
  }, [analysis]);
  

  return (
    <div className="min-h-screen w-full mb-3 flex flex-col items-center justify-center px-6  lg:py-2 md:py-8">

      {}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <ResumeHeroLeft />
        <div className="w-full flex justify-center lg:justify-end">
          <ResumeUploaderRight onAnalysisUpdate={setAnalysis} onDone={handleDone} />
        </div>
      </div>

    

      {}
      {hasAnalysis && (
        <div
          ref={resultsRef}
          className="w-full lg:max-w-6xl mt-7 rounded-xl"
        >
          <AnalysisResult analysis={analysis} />
        </div>
      )}
    </div>
  );
}