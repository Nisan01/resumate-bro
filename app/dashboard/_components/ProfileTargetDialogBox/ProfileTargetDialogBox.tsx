"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";

const roleOptions = [
  "Frontend Dev", "Backend Dev", "Full Stack", "ML Engineer",
  "DevOps", "Data Scientist", "Cloud Architect", "Cybersecurity",
];

const industryOptions = [
  "Software Engineering", "Data Science", "Cybersecurity",
  "Cloud / DevOps", "AI / ML", "Fintech", "Web3",
];

export default function TargetProfileDialog({
  forceOpen,
  onClose,
}: {
  forceOpen?: boolean;
  onClose?: () => void;
} = {}) {


  const { user, updateUser } = useUser();

  const [open, setOpen] = useState(false);
  const [role, setRole] = useState("");
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
useEffect(() => {
  if (!user || dismissed) return;
  if (!user.targetRole || !user.targetIndustry) {
    setRole(user.targetRole ?? "");
    setIndustry(user.targetIndustry ?? "");
    setOpen(true);
  }
}, [user, dismissed]); 

 useEffect(() => {
    if (forceOpen) {
      setDismissed(false);
      setOpen(true);
    }
  }, [forceOpen]);

  if (!open) return null;

const handleSubmit = async () => {
    try {
      setLoading(true);
      await updateUser({ targetRole: role || undefined, targetIndustry: industry || undefined });
      console.log("Target Roles Submitted!");
      handleClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
   const handleClose = () => {
    setDismissed(true);
    setOpen(false);
    onClose?.();
  };

 const handleSkip = () => handleClose();

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full bg-purple-700/20 blur-3xl"
        animate={{ x: [0, 60, -40, 0], y: [0, -50, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full bg-pink-600/15 blur-3xl"
        animate={{ x: [0, -70, 50, 0], y: [0, 40, -60, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-md rounded-2xl p-7 bg-gradient-to-br from-[#140a25] via-[#2a1245] to-[#0c0618] shadow-2xl border border-purple-500/20"
      >
        <h2 className="text-xl font-semibold text-white mb-1">
          Set Your Target 🎯
        </h2>
        <p className="text-[12px] italic text-purple-400 mb-6">
          Choose your goal or skip, you can always update later.
        </p>

        {/* Role */}
        <div className="mb-5">
          <label className="text-[13px] text-purple-200 block mb-1.5">Target Role</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Frontend Developer"
            className="w-full px-3 py-2 rounded-xl bg-black/40 text-white border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 text-[13px]"
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {roleOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setRole(opt)}
                className={`px-3 py-1 rounded-full text-[11px] border transition-all duration-150
                  ${role === opt
                    ? "bg-gradient-to-r from-purple-600/60 to-pink-500/50 border-pink-500/60 text-white shadow-[0_0_8px_rgba(168,85,247,0.4)]"
                    : "bg-purple-500/8 border-purple-500/30 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400/60 hover:text-purple-100 hover:-translate-y-0.5"
                  }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Industry */}
        <div className="mb-7">
          <label className="text-[13px] text-purple-200 block mb-1.5">Target Industry</label>
          <input
            type="text"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g. Software Engineering"
            className="w-full px-3 py-2 rounded-xl bg-black/40 text-white border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 text-[13px]"
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {industryOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setIndustry(opt)}
                className={`px-3 py-1 rounded-full text-[11px] border transition-all duration-150
                  ${industry === opt
                    ? "bg-gradient-to-r from-purple-600/60 to-pink-500/50 border-pink-500/60 text-white shadow-[0_0_8px_rgba(168,85,247,0.4)]"
                    : "bg-purple-500/8 border-purple-500/30 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400/60 hover:text-purple-100 hover:-translate-y-0.5"
                  }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div>
            <button
              onClick={handleSkip} // ✅ was calling setOpen(false) directly — dismissed never set
              className="text-sm text-purple-300 hover:text-white transition-colors"
            >
              Skip
            </button>
            <p className="text-[10px] text-purple-200/35 mt-0.5">
              [ Default: Software Engineer ]
            </p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm font-medium shadow-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}