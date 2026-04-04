import React from 'react'
import DashBoardNav from './_components/DashboardNav/Navbar'
import {Inter} from "next/font/google";
import { ResumeRequiredGate } from "@/components/dashboard/ResumeRequiredGate";


const inter=Inter({
  variable:"--font-inter",
  subsets:["latin"],
  weight: ["400", "500", "600", "700"],
});


function layout({children}: { children: React.ReactNode }) {
  return (
<>


<div className={`w-full h-screen p-2.5 bg-[#D7CCD9] box-border ${inter.className}`}>
        <div className="w-full h-full bg-gray-50 rounded-xl overflow-hidden">
          <div className="flex h-full">

            {/* Sidebar — auto width, driven by the component itself */}
            <div className="h-full shrink-0 border-gray-200 z-10" style={{ isolation: "isolate" }}>
              <DashBoardNav />
            </div>

            {/* Main content */}
            <div className="h-full flex-1 min-w-0 relative"
              style={{
                backgroundImage: "url('/bg.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="absolute inset-0"
                style={{
                  background: "linear-gradient(to right, rgba(75,0,130,0.3), rgba(148,0,211,0.3))",
                }}
              />
              <div className={`relative z-10 h-full overflow-y-auto  `}>
                <ResumeRequiredGate>{children}</ResumeRequiredGate>
              </div>
            </div>

          </div>
        </div>
      </div>

</>  )
}

export default layout