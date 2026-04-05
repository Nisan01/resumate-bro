"use client";

import { useState, useEffect, useRef } from "react";
import { Medal } from "lucide-react";
import AnalysisResult from "./_components/analysis-result/AnalysisResult";
import ResumeHeroLeft from "./_components/resume-hero-left/ResumeHeroLeft";
import ResumeUploaderRight from "./_components/resume-hero-right/ResumeHeroRight";
import { toast } from "react-toastify";
import { useUser } from "@/context/UserContext";

export default function Page() {
  const resultsRef = useRef<HTMLDivElement>(null);
  const [analysis, setAnalysis] = useState<Record<string, any>>({});
  const { user, loading } = useUser();

  const hasAnalysis = Object.keys(analysis).some(k => k !== "header");

const handleDone =async () => {
  resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
try {
    const response = await fetch("/api/resume/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        analysis: analysis,
        userId: user?.id, 
      }),
    });

    if (response.ok) {
      toast.success("Analysis saved successfully!",{
        position: "bottom-right",
      });
    }
  } catch (err) {
    toast.error("Failed to save to DB:", {
      position: "bottom-right",
    });
  }



};

  // Auto-scroll when first real section arrives
  useEffect(() => {
    if (hasAnalysis) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [hasAnalysis]);

  // Debug log
  useEffect(() => {
    if (Object.keys(analysis).length > 0) {
      console.log("📊 Analysis update:", analysis);
    }
  }, [analysis]);
  

  return (
    <div className="min-h-screen w-full mb-3 flex flex-col items-center justify-center px-6  lg:py-2 md:py-8">

      {/* ── Hero / Upload ── */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <ResumeHeroLeft />
        <div className="w-full flex justify-center lg:justify-end">
          <ResumeUploaderRight onAnalysisUpdate={setAnalysis} onDone={handleDone} />
        </div>
      </div>

    

      {/* ── Analysis Result ── */}
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