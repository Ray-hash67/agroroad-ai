import React from 'react';

interface AnalyticsGrowthLogoProps {
  className?: string;
}

export const AnalyticsGrowthLogo: React.FC<AnalyticsGrowthLogoProps> = ({
  className = 'w-full h-full'
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Modern Blue Analytics Growth Icon"
    >
      <defs>
        {/* Horizontal Base Bar Gradient */}
        <linearGradient id="growthBaseGrad" x1="10" y1="76" x2="90" y2="76" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0B3C9B" />
          <stop offset="60%" stopColor="#0066FF" />
          <stop offset="100%" stopColor="#007BFE" />
        </linearGradient>

        {/* Vertical Chart Columns Gradient */}
        <linearGradient id="growthColGrad" x1="50" y1="74" x2="50" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#083896" />
          <stop offset="45%" stopColor="#0056D6" />
          <stop offset="100%" stopColor="#007BFE" />
        </linearGradient>

        {/* Trend Line Gradient */}
        <linearGradient id="growthLineGrad" x1="21" y1="52" x2="80" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0062F5" />
          <stop offset="50%" stopColor="#0078FE" />
          <stop offset="100%" stopColor="#0084FF" />
        </linearGradient>

        {/* Dots Radial Gradient with Specular Glow */}
        <radialGradient id="growthDotGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="45%" stopColor="#007BFE" />
          <stop offset="100%" stopColor="#0056D6" />
        </radialGradient>
      </defs>

      {/* 1. Horizontal Base Platform */}
      <rect x="11" y="75" width="76" height="4" rx="2" fill="url(#growthBaseGrad)" />

      {/* 2. Four Ascending Chart Bars with Rounded Corners */}
      <rect x="15" y="59" width="14.5" height="14" rx="2" fill="url(#growthColGrad)" />
      <rect x="33" y="50" width="15.5" height="23" rx="2.5" fill="url(#growthColGrad)" />
      <rect x="52" y="43" width="15.5" height="30" rx="2.5" fill="url(#growthColGrad)" />
      <rect x="70.5" y="33.5" width="14.5" height="39.5" rx="2.5" fill="url(#growthColGrad)" />

      {/* 3. Ascending Trend Line */}
      <line
        x1="22.2"
        y1="52"
        x2="78"
        y2="25.5"
        stroke="url(#growthLineGrad)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      {/* 4. Four Circular Nodes on Trend Line */}
      <circle cx="22.2" cy="52" r="4.6" fill="url(#growthDotGrad)" />
      <circle cx="40.8" cy="43.2" r="4.6" fill="url(#growthDotGrad)" />
      <circle cx="59.5" cy="34.2" r="4.6" fill="url(#growthDotGrad)" />
      <circle cx="78" cy="25.5" r="4.8" fill="url(#growthDotGrad)" />
    </svg>
  );
};
