import React from 'react'

function OrbLayer() {
  return (
     <div className="orb-layer" aria-hidden="true">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />
      <div
        className="orb-ring"
        style={{ width: 280, height: 280, top: "20%", right: "22%", animationDuration: "28s", animationDelay: "-10s", opacity: 0.3 }}
      />
      <div
        className="orb-ring"
        style={{ width: 180, height: 180, bottom: "25%", left: "18%", animationDuration: "20s", animationDelay: "-7s", opacity: 0.25 }}
      />
      <div
        className="orb"
        style={{ width: 260, height: 260, bottom: -60, right: -40, animationDuration: "25s", animationDelay: "-12s", opacity: 0.35 }}
      />
    </div>
  )
}

export default OrbLayer