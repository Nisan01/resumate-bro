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
  { label: "Practice Questions", path: "practice-questions", icon: UserPlus },
  { label: "Projects",           path: "projects",           icon: UserCheck },
  
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
    if (path === "") {
      // Only active when exactly on /dashboard, not on sub-routes
      return currentPath === "/dashboard" || currentPath === "/dashboard/";
    }
    return currentPath?.startsWith(`/dashboard/${path}`);
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
          bg-purple-400/5 backdrop-blur-xl border-r border-white/10
          ${expanded ? 'w-[220px] lg:w-[300px]' : 'w-[77px]'}
        `}
        style={{
          transition: 'width 0.6s cubic-bezier(0.65, 0, 0.35, 1)',
        }}
      >

{/* ── Header ── */}
<div
  className={`
    flex items-center h-[64px] transition-all duration-500 shrink-0 border-b border-white/10
    ${expanded ? 'px-4' : 'px-[13px]'}
  `}
>
  <button
   onClick={() => {
  // Only allow expansion if the screen is large (lg breakpoint is 1024px)
  if (window.innerWidth >= 640) {
    setExpanded(!expanded);
  }
}}
    className="group shrink-0 flex items-center justify-center transition-transform active:scale-95"
    aria-label="Toggle sidebar"
  >
    {/* 1. CONTAINER WITH SPLIT RING EFFECT */}
    <div className={`
      relative flex items-center justify-center rounded-full
      transition-all duration-500 ease-in-out
      ${expanded ? 'w-9 h-9' : 'w-8 h-8'}

      /* THE "BEFORE" ARC (Top) */
      before:content-[""] before:absolute before:inset-[-4px] before:rounded-full
      before:border-2 before:border-transparent before:border-t-[#c4b0ff]
      before:shadow-[0_-5px_10px_rgba(196,176,255,0.3)]

      /* THE "AFTER" ARC (Bottom) */
      after:content-[""] after:absolute after:inset-[-4px] after:rounded-full
      after:border-2 after:border-transparent after:border-b-[#c4b0ff]
      after:shadow-[0_5px_10px_rgba(196,176,255,0.3)]
    `}>
      
      {/* 2. INNER IMAGE (The actual circle) */}
      <div className="relative w-full h-full rounded-full overflow-hidden border border-white/10 bg-black/20">
        <Image 
          src="/logo.png" 
          alt="Resumate Logo" 
          fill
          sizes="50px"
          className="object-cover"
          priority
        />
      </div>

      {/* 3. HOVER ROTATION EFFECT (Optional but cool) */}
      <div className="absolute inset-[-4px] rounded-full border-2 border-transparent group-hover:rotate-180 transition-transform duration-700 ease-in-out" />
    </div>
  </button>

  {/* 4. THE NAME */}
  <div
    className="overflow-hidden transition-all flex items-center"
    style={{ 
      transitionDuration: '0.6s',
      transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)',
      maxWidth: expanded ? '150px' : '0px',
      opacity: expanded ? 1 : 0,
    }}
  >
    <h2 className="text-[16px] font-bold whitespace-nowrap tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent ml-4">
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
         <span 
  className={`
    text-sm font-normal whitespace-nowrap overflow-hidden transition-all
    ${expanded ? 'opacity-100' : 'opacity-0'}
  `}
  style={{ 
    /* Match the sidebar's timing exactly */
    transitionDuration: '0.6s',
    transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)',
    /* Ensure the width also animates so it doesn't push the icon */
    maxWidth: expanded ? '200px' : '0px' 
  }}
>
  {item.label}
</span>
        </div>
      </li>
    );
  })}
</ul>



<div className="p-2 border-t border-white/10">
  <div
    className={`
      flex items-center rounded-lg cursor-pointer transition-all duration-300
      ${expanded ? 'px-2 py-2 gap-3' : 'py-2 px-1.5 gap-0'}
      hover:bg-white/10
    `}
  >
 {/* Avatar Wrapper - This handles the border and background */}
<div className="bg-white rounded-full p-[4px] shrink-0 shadow-sm">
  {/* Animation Wrapper - This handles the smooth scaling */}
  <div 
    className="relative overflow-hidden rounded-full transition-all"
    style={{ 
      transitionDuration: '0.6s',
      transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)',
      // Instead of changing width props, we scale the entire element
      transform: expanded ? 'scale(1)' : 'scale(0.85)',
      width: '32px',
      height: '32px'
    }}
  >
    <Image
      src={user?.avatarUrl || `https://api.dicebear.com/9.x/pixel-art/svg?seed=${user?.name || 'User'}`}
      alt={user?.name || 'User'}
      fill 
      sizes='50PX'
      className="rounded-full object-cover"
    />
  </div>
</div>

    {/* Text Container with Sync'd Animation */}
    <div 
      className={`
        flex flex-col min-w-0 flex-1 overflow-hidden transition-all
        ${expanded ? 'opacity-100 ml-1' : 'opacity-0 ml-1'}
      `}
      style={{ 
        transitionDuration: '0.6s',
        transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)',
        maxWidth: expanded ? '200px' : '0px' 
      }}
    >
      <span className="text-[13px] font-medium truncate leading-tight text-gray-200">
        {user?.name || user?.id || "Loading..."}
      </span>
      <span className="text-[11px] truncate text-[#4a5a7a]">
        {user?.email || ""}
      </span>
    </div>

    {/* Ellipsis with Sync'd Fade */}
    <div 
      className={`transition-all duration-500 ${expanded ? 'opacity-100' : 'opacity-0 w-0'}`}
    >
      <EllipsisVertical size={16} className="shrink-0 text-gray-300" />
    </div>
  </div>
</div>

      </aside>
    </>
  );
}

export default DashBoardNav;