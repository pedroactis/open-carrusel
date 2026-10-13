"use client";

import type { AspectRatio } from "@/types/carousel";
import { DIMENSIONS } from "@/types/carousel";

interface SafeZoneOverlayProps {
  aspectRatio: AspectRatio;
  visible: boolean;
}

export function SafeZoneOverlay({ aspectRatio, visible }: SafeZoneOverlayProps) {
  if (!visible) return null;

  const { width, height } = DIMENSIONS[aspectRatio];

  // Grid crop: since 2025 the profile grid shows a 3:4 center cut (not a square).
  // Wider than 3:4 (1:1, 4:5) loses the sides; taller (9:16) loses top and bottom.
  const gridIsNarrower = width / height > 3 / 4;
  const sideCrop = gridIsNarrower ? ((width - (height * 3) / 4) / 2 / width) * 100 : 0;
  const vertCrop = gridIsNarrower ? 0 : ((height - (width * 4) / 3) / 2 / height) * 100;

  // Bottom UI overlay: ~14% of height (like/save buttons area)
  const bottomUiPercent = 14;

  const cropBox = "absolute bg-red-500/10 border-dashed border-red-400/50";
  const cropLabel = "absolute text-[8px] text-red-500/70 font-medium";

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Grid crop zones (3:4 thumbnail on the profile) */}
      {sideCrop > 0 && (
        <>
          <div className={`${cropBox} left-0 top-0 bottom-0 border-r`} style={{ width: `${sideCrop}%` }} />
          <div className={`${cropBox} right-0 top-0 bottom-0 border-l`} style={{ width: `${sideCrop}%` }} />
          <span className={`${cropLabel} left-2 z-10`} style={{ bottom: `calc(${bottomUiPercent}% + 4px)`, left: `calc(${sideCrop}% + 4px)` }}>
            Corte na grade (3:4) nas laterais
          </span>
        </>
      )}
      {vertCrop > 0 && (
        <>
          <div className={`${cropBox} left-0 right-0 top-0 border-b`} style={{ height: `${vertCrop}%` }}>
            <span className={`${cropLabel} bottom-1 left-2`}>Corte na grade (3:4)</span>
          </div>
          <div className={`${cropBox} left-0 right-0 bottom-0 border-t`} style={{ height: `${vertCrop}%` }}>
            <span className={`${cropLabel} top-1 left-2`}>Corte na grade (3:4)</span>
          </div>
        </>
      )}

      {/* Bottom UI overlay zone */}
      <div
        className="absolute left-0 right-0 bottom-0 bg-blue-500/8 border-t border-dashed border-blue-400/40"
        style={{ height: `${bottomUiPercent}%` }}
      >
        <span className="absolute top-1 right-2 text-[8px] text-blue-500/60 font-medium">
          Interface do Instagram
        </span>
      </div>

      {/* Safe zone border — center 80% */}
      <div
        className="absolute border border-dashed border-green-400/40 rounded-sm"
        style={{
          left: "10%",
          right: "10%",
          top: "10%",
          bottom: `${Math.max(10, bottomUiPercent + 2)}%`,
        }}
      >
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] text-green-500/70 font-medium bg-white/80 px-1 rounded">
          Área segura
        </span>
      </div>
    </div>
  );
}
