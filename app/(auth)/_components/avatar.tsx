"use client";
import { useState, useEffect } from "react";

const styles = [
  { name: "Pixel Art", key: "pixel-art" },
  { name: "Bottts", key: "bottts" },
  { name: "Fun Emoji", key: "fun-emoji" },
  { name: "Toon Head", key: "toon-head" },
  { name: "Dylan", key: "dylan" },
  { name: "Adventurer", key: "adventurer" },
];

const seeds = ["Felix", "Aneka", "Alex", "Jamie", "Nova", "Echo"];

const PALETTE = [
  "bg-purple-200", "bg-pink-200", "bg-blue-200", "bg-emerald-200",
  "bg-orange-200", "bg-lime-200", "bg-cyan-200", "bg-fuchsia-200",
  "bg-yellow-200", "bg-indigo-200",
];

function getBg(seed: string, styleKey: string) {
  const hash = (seed + styleKey)
    .split("")
    .reduce((a, c) => a + c.charCodeAt(0), 0);
  return PALETTE[hash % PALETTE.length];
}

interface AvatarSelectorProps {
  email?: string;
  onSelect: (avatarUrl: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function AvatarSelector({
  onSelect,
  isOpen,
  onClose,
}: AvatarSelectorProps) {
  const [selectedUrl, setSelectedUrl] = useState("");
  const [activeStyle, setActiveStyle] = useState(styles[0].key);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const activeStyleObj = styles.find((s) => s.key === activeStyle)!;

  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        visible ? "bg-black/60 backdrop-blur-md" : "bg-black/0 backdrop-blur-none"
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`flex flex-col w-[520px] max-h-[88vh] bg-[#0c0c10] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ease-out ${
          visible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-4 scale-[0.97]"
        }`}
      >
        {}
        <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-white/[0.06] shrink-0">
          <div>
            <p className="text-[11px] font-medium tracking-widest uppercase text-white/30 mb-1">
              Personalize
            </p>
            <h2 className="text-[22px] font-semibold text-white/90 tracking-tight">
              Choose your avatar
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/50 text-lg hover:bg-white/[0.12] hover:text-white/85 transition-all duration-150 cursor-pointer"
          >
            ×
          </button>
        </div>

        {}
        <div className="px-7 pt-4 shrink-0">
          <div className="flex gap-1.5 overflow-x-auto pb-4 [scrollbar-width:none]">
            {styles.map((s) => (
              <button
                key={s.key}
                onClick={() => setActiveStyle(s.key)}
                className={`shrink-0 px-3.5 py-1.5 rounded-lg text-[13px] transition-all duration-150 cursor-pointer ${
                  activeStyle === s.key
                    ? "bg-white/10 border border-white/20 text-white/90 font-medium"
                    : "bg-white/[0.03] border border-white/[0.07] text-white/40 hover:text-white/70 hover:bg-white/[0.06]"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {}
        <div className="px-7 pb-7 overflow-y-auto grow">
          <p className="text-[12px] text-white/25 mb-3.5 tracking-wide">
            {seeds.length} options · {activeStyleObj.name}
          </p>

          <div className="grid grid-cols-3 gap-3">
            {seeds.map((seed) => {
              const avatarUrl = `https://api.dicebear.com/9.x/${activeStyle}/svg?seed=${encodeURIComponent(
                seed
              )}`;
              const bgClass = getBg(seed, activeStyle);
              const isSelected = selectedUrl === avatarUrl;

              return (
                <button
                  key={avatarUrl}
                  onClick={() => {
                    setSelectedUrl(avatarUrl);
                    onSelect(avatarUrl);
                    onClose();
                  }}
                  className={`group relative aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all duration-150 hover:scale-[1.03] active:scale-[0.98] ${
                    isSelected
                      ? "border-2 border-white/60"
                      : "border border-white/[0.06] hover:border-white/20"
                  }`}
                >
                  {}
                  <div className={`absolute inset-0 ${bgClass} opacity-15`} />

                  {}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div
                      className={`w-[60%] h-[60%] rounded-full ${bgClass} flex items-center justify-center`}
                    >
                      <img
                        src={avatarUrl}
                        alt={`${activeStyleObj.name} ${seed}`}
                        className="w-[80%] h-[80%] rounded-full"
                      />
                    </div>
                    <span className="mt-2 text-[11px] font-medium text-white/40 tracking-wide">
                      {seed}
                    </span>
                  </div>

                  {}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-md bg-white/90 flex items-center justify-center z-10">
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path
                          d="M1 4L3.5 6.5L9 1"
                          stroke="#000"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
