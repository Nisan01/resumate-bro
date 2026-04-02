"use client"
import React, { useState } from 'react'
import {
  LayoutDashboard, UserPlus, UserCheck, Settings,
  Calendar, Eye, Play, FileText, EllipsisVertical,BotMessageSquare
} from 'lucide-react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/context/UserContext';

const navItems = [
  {label:"Dashboard",         path: "",         icon: LayoutDashboard },
    { label: "Resume Analyzer",    path: "resume-analyzer",    icon: Eye },
  { label: "AI Career Coach",    path: "ai-career-coach",    icon: BotMessageSquare },
  { label: "Practice Questions", path: "practice-questions", icon: UserPlus },
  { label: "Projects",           path: "projects",           icon: UserCheck },
  { label: "Reports",            path: "reports",            icon: FileText },
  
  { label: "Roadmap",            path: "roadmap",            icon: Calendar },
  {
   label: "Skills Tracker",     path: "skills-tracker",     icon: Play },
   {label: "Settings",           path: "settings",           icon: Settings }
];

const avatarGradientClass = "bg-gradient-to-r";

function DashBoardNav() {
  const router = useRouter();
  const currentPath = usePathname();
  const { user } = useUser();
  const [expanded, setExpanded] = useState(false);

  const navigate = (path: string) => {
    router.push(path ? `/dashboard/${path}` : "/dashboard");
    setExpanded(false);
  };

const isActive = (path: string) => {
  if (!currentPath) return false;
  if (path === "") return currentPath === "/dashboard";
  return currentPath.startsWith(`/dashboard/${path}`);
};
  return (
    <>
      {expanded && (
        <div
          className="fixed inset-0 z-10 bg-black/50 lg:hidden"
          onClick={() => setExpanded(false)}
        />
      )}

      <aside
        className={`
          h-full flex flex-col p-2 overflow-hidden z-30 relative
          ${expanded ? 'w-56 lg:w-72' : 'w-20'}
        `}
        style={{
          transition: 'width 0.6s cubic-bezier(0.65, 0, 0.35, 1)',
          background: 'linear-gradient(180deg, #0a0f2e 0%, #0d1540 30%, #0b1535 60%, #080d24 100%)',
          borderRight: '1px solid rgba(99, 130, 220, 0.12)',
        }}
      >

        {/* ── Header ── */}
        <div
          className={`flex items-center h-16 transition-all duration-300 shrink-0 ${expanded ? 'px-3 gap-3' : 'px-3 gap-3'}`}
          style={{ borderBottom: '1px solid rgba(99, 130, 220, 0.1)' }}
        >
          <button
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 flex items-center justify-center"
            aria-label="Toggle sidebar"
          >
          <div className={`sm:w-9 sm:h-9 rounded-xl ${avatarGradientClass} from-[#c4b0ff] via-[#7ee8fa] to-[#ff9de2] flex items-center justify-center text-[10px] sm:text-xl text-[#0a0714] shadow-[0_4px_16px_rgba(196,176,255,0.36)]`}>R</div>
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-w-50 opacity-100' : 'max-w-0 opacity-0 pointer-events-none'}`}
            style={{ transition: 'max-width 0.6s cubic-bezier(0.65, 0, 0.35, 1), opacity 0.6s cubic-bezier(0.65, 0, 0.35, 1)' }}
          >
            <h2 className="text-[15px] font-semibold whitespace-nowrap leading-tight" style={{ color: '#e2e8f0' }}>
              ResuMate
            </h2>
          </div>
        </div>

<ul className="flex flex-col gap-1 mt-2 p-1 flex-1 overflow-y-auto">
  {navItems.map((item, index) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    return (
      <li key={index} className="w-full">
        <div
          onClick={() => navigate(item.path)}
          className={`
            flex items-center rounded-lg cursor-pointer transition-all duration-150 px-4 py-2 gap-3
            ${active
              ? 'bg-linear-to-r from-purple-600 to-purple-800 text-white shadow-lg'
              : 'text-[#7a8fb5] hover:bg-white/10 hover:text-white'
            }
          `}
        >
          <Icon className="shrink-0 w-5 h-5" />
          <span className={`text-sm font-normal whitespace-nowrap overflow-hidden block ${expanded ? 'max-w-50 opacity-100' : 'max-w-0 opacity-0'}`}>
            {item.label}
          </span>
        </div>
      </li>
    );
  })}
</ul>


{/* ── User Footer ── */}
<div className="p-2 border-t border-[rgba(99,130,220,0.1)]">
  <div
    className={`
      flex items-center rounded-lg cursor-pointer transition-all duration-300
      ${expanded ? 'px-2 py-2 gap-3' : ' py-2 px-1.5'}
      hover:bg-white/10
    `}
  >
    {/* White circle wrapper */}
    <div className="bg-white rounded-full p-0.5 shrink-0">
      <Image
        src={user?.avatarUrl || `https://api.dicebear.com/9.x/pixel-art/svg?seed=${user?.name || 'User'}`}
        alt={user?.name || 'User'}
        width={expanded ? 32 : 26}
        height={expanded ? 32 : 26}
        className="rounded-full"
      />
    </div>

    <div className={`
      flex flex-col min-w-0 flex-1 overflow-hidden transition-all duration-300
      ${expanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}
    `}>
      <span className="text-[13px] font-medium truncate leading-tight text-gray-200">
        {user?.name || user?.id || "Loading..."}
      </span>
      <span className="text-[11px] truncate text-[#4a5a7a]">
        {user?.email || ""}
      </span>
    </div>

    {expanded && (
      <EllipsisVertical size={16} className="shrink-0 text-gray-300" />
    )}
  </div>
</div>

      </aside>
    </>
  );
}

export default DashBoardNav;