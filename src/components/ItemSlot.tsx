"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface ItemSlotProps {
  item?: {
    itemId: number;
    name: string;
    icon: string;
    quality?: string;
    quantity?: number;
    professionQuality?: number; // 1: Bronze, 2: Silver, 3: Gold
    rarity?: "common" | "uncommon" | "rare" | "epic" | "legendary";
    type?: string;
    description?: string;
  };
  slotIndex: number;
  onAction?: (item: any) => void;
}

const rarityColors: Record<string, string> = {
  Common: "#ffffff",
  Uncommon: "#1eff00",
  Rare: "#0070dd",
  Epic: "#a335ee",
  Legendary: "#ff8000",
};

export default function ItemSlot({ item, slotIndex, onAction }: ItemSlotProps) {
  const [hovered, setHovered] = useState(false);
  const slotRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div
        ref={slotRef}
        className="relative group cursor-pointer"
        style={{ width: "100%", height: "100%" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Base slot "pouch" background */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
            border: "1px solid #1a1510",
            borderTopColor: "#000",
            borderLeftColor: "#000",
            borderRadius: "3px",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.8), 0 1px 1px rgba(255,255,255,0.05)",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Subtle inner texture/grain */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" 
            style={{ 
              backgroundImage: "url('https://www.transparenttextures.com/patterns/dark-leather.png')",
              backgroundSize: "200px"
            }} 
          />

          {/* Default wing icon for empty slots */}
          {!item && (
            <img 
              src="/slot-defect.jpg" 
              alt=""
              className="w-full h-full object-contain opacity-50 brightness-110"
              style={{ position: 'relative', zIndex: 1 }}
            />
          )}
        </div>

        {/* Item Content */}
        {item ? (
          <div className="absolute inset-1 z-1 block">
            <a
              href={`https://www.wowhead.com/item=${item.itemId}`}
              data-wowhead={`item=${item.itemId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full h-full"
            >
              <Image
                src={item.icon}
                alt={item.name}
                fill
                className="object-cover rounded-sm"
                style={{
                  filter: hovered ? "brightness(1.15)" : "brightness(1)",
                  border: `1px solid ${rarityColors[item.quality || "Common"]}44`,
                  transition: "filter 0.15s",
                }}
              />
            </a>
            
            {/* Profession Quality Indicator */}
            {item.professionQuality && (
              <div className="absolute top-0 left-0 p-0.5 z-10 pointer-events-none">
                <div 
                  className="w-[11px] h-[11px] rounded-full border border-black/80 shadow-[0_0_5px_rgba(0,0,0,0.8)] flex items-center justify-center p-[1px]"
                  style={{ 
                    backgroundColor: "#111",
                  }}
                >
                  <div 
                    className="w-full h-full rounded-full shadow-inner"
                    style={{ 
                      backgroundColor: 
                        item.professionQuality === 3 ? "#fbbf24" : // Gold
                        item.professionQuality === 2 ? "#e0e0e0" : // Silver
                        "#cd7f32", // Bronze
                      boxShadow: `0 0 6px ${
                        item.professionQuality === 3 ? "rgba(251,191,36,0.5)" : 
                        item.professionQuality === 2 ? "rgba(255,255,255,0.4)" : 
                        "rgba(205,127,50,0.4)"
                      }`
                    }}
                  />
                </div>
              </div>
            )}

            {/* Quantity Badge */}
            {(item.quantity || 1) > 1 && (
              <span className="absolute bottom-0 right-0.5 text-white font-bold text-[11px] drop-shadow-[0_1px_1px_rgba(0,0,0,1)] z-10 pointer-events-none">
                {item.quantity}
              </span>
            )}

            {/* Edit Button on Hover */}
            {hovered && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onAction?.(item);
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-[#1a120a]/90 border border-[#c8a96e] px-2 py-0.5 rounded text-[9px] text-[#c8a96e] font-bold uppercase tracking-wider shadow-lg hover:bg-[#3d2e1a] hover:text-white transition-all scale-110"
              >
                Editar
              </button>
            )}
          </div>
        ) : (
          /* "Agregar" button in empty slots on hover */
          hovered && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAction?.(null);
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-[#1a120a]/80 border border-[#3d2e1a] px-2 py-0.5 rounded text-[8px] text-[#5a4832] font-bold uppercase tracking-wider shadow-lg hover:border-[#c8a96e] hover:text-[#c8a96e] transition-all"
            >
              Añadir
            </button>
          )
        )}

        {/* Hover highlight overlay */}
        <div
          className="absolute transition-all duration-150 pointer-events-none"
          style={{
            inset: "-1px", 
            border: hovered ? "1.5px solid #4fc3f7" : "1.5px solid transparent",
            boxShadow: hovered ? "0 0 10px 2px rgba(79, 195, 247, 0.4), inset 0 0 8px rgba(79, 195, 247, 0.2)" : "none",
            borderRadius: "4px",
            backgroundColor: hovered ? "rgba(79, 195, 247, 0.08)" : "transparent",
            zIndex: 10,
            opacity: hovered ? 1 : 0,
          }}
        />
      </div>
    </>
  );
}
