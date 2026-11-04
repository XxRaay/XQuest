import React from 'react';

export function Logo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={className}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Outer faceted crystal polygon */}
      <polygon
        points="12,2 21,7 21,17 12,22 3,17 3,7"
        className="stroke-sky-400 fill-sky-500/10"
      />
      {/* Inner facet lines */}
      <line x1="12" y1="2" x2="12" y2="22" className="stroke-sky-400/60" strokeWidth="1.2" />
      <polyline points="3,7 12,12 21,7" className="stroke-sky-400/70" strokeWidth="1.2" />
      <polyline points="3,17 12,12 21,17" className="stroke-sky-400/70" strokeWidth="1.2" />
      {/* Glowing core */}
      <circle cx="12" cy="12" r="2.2" className="fill-sky-400 stroke-none" />
    </svg>
  );
}
