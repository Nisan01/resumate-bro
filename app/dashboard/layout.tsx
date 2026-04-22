import React from 'react'
import DashBoardNav from './_components/DashboardNav/Navbar'
import { Inter } from "next/font/google";
import './_components/css/Dashboard.css'
import TargetProfileDialog from './_components/ProfileTargetDialogBox/ProfileTargetDialogBox';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

function layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div
        className={`dashboard-root w-full h-screen overflow-hidden relative ${inter.className}`}
        style={{ background: '#080b12', color: '#f0eeff' }}
      >
        <div className="dashboard-bg-gradient" />
        <div className="dashboard-bg-noise" />

        <div className="dashboard-orb-layer" aria-hidden="true">
          <div
            className="dashboard-orb"
            style={{ width: 340, height: 340, top: -80, right: '8%', animationDuration: '22s', opacity: 0.45 }}
          />
          <div
            className="dashboard-orb"
            style={{ width: 200, height: 200, top: '38%', left: '2%', animationDuration: '18s', animationDelay: '-6s', opacity: 0.35 }}
          />
          <div
            className="dashboard-orb"
            style={{ width: 120, height: 120, bottom: '12%', left: '45%', animationDuration: '15s', animationDelay: '-4s', opacity: 0.3 }}
          />
          <div
            className="dashboard-orb"
            style={{ width: 80, height: 80, top: '14%', left: '42%', animationDuration: '12s', animationDelay: '-2s', opacity: 0.4 }}
          />
          <div
            className="dashboard-orb-ring"
            style={{ width: 280, height: 280, top: '20%', right: '22%', animationDuration: '28s', animationDelay: '-10s', opacity: 0.2 }}
          />
          <div
            className="dashboard-orb-ring"
            style={{ width: 180, height: 180, bottom: '25%', left: '18%', animationDuration: '20s', animationDelay: '-7s', opacity: 0.15 }}
          />
          <div
            className="dashboard-orb"
            style={{ width: 260, height: 260, bottom: -60, right: -40, animationDuration: '25s', animationDelay: '-12s', opacity: 0.25 }}
          />
        </div>

        {}
        <div className="relative z-10 flex h-full">
          {}
          <div className="dashboard-sidebar">
            <DashBoardNav />
          </div>

<TargetProfileDialog  />

          <div id="main-scroll" className="flex-1 min-w-0 h-full overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

export default layout