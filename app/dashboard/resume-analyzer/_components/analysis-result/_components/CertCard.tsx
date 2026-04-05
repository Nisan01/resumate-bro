import React from 'react'

interface CertCardProps {
  type: string;
  name: string;
  desc: string;
  impact: string;
  muted?: boolean;
}


function CertCard({ type, name, desc, impact, muted }: CertCardProps) {
  return (
<>


    <div className="cert-card p-5 rounded-2xl" style={{ background:"rgba(8,11,22,0.50)", border:"1px solid rgba(255,255,255,0.07)" }}>
      <div className="text-[10px] font-semibold tracking-[0.10em] uppercase mb-2 flex items-center gap-1.5" style={{ color:"rgba(220,215,255,0.50)" }}>{type}</div>
      <div className="text-[15px] font-semibold mb-1.5 tracking-tight" style={{ color:"rgba(240,238,255,0.90)" }}>{name}</div>
      <div className="text-[12px] leading-[1.55] mb-2.5 font-light" style={{ color:"rgba(220,215,255,0.60)" }}>{desc}</div>
      <div className="text-[12px] rounded-lg px-2.5 py-1.5 flex items-center gap-1.5" style={muted
        ? { color:"rgba(220,215,255,0.50)", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.08)" }
        : { color:"#7ee8fa", background:"rgba(126,232,250,0.06)", border:"1px solid rgba(126,232,250,0.14)" }}>
        {impact}
      </div>
    </div>


</>  )
}

export default CertCard