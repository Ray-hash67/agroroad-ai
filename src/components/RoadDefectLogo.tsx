import React from 'react';
import {
  DEFECT_TRANSVERSE_CRACK_IMG,
  DEFECT_ALLIGATOR_CRACK_IMG,
  DEFECT_LONGITUDINAL_CRACK_IMG,
  DEFECT_POTHOLE_IMG,
  DEFECT_MANHOLE_HAZARD_IMG,
} from '../data/mockData';

export type DefectLogoType = 
  | 'transverse_crack'
  | 'alligator_crack'
  | 'longitudinal_crack'
  | 'pothole'
  | 'manhole_hazard'
  | 'crack'
  | 'other';

interface RoadDefectLogoProps {
  type: DefectLogoType | string;
  className?: string;
  title?: string;
  showBadge?: boolean;
}

export const RoadDefectLogo: React.FC<RoadDefectLogoProps> = ({
  type,
  className = 'w-full h-full',
  title,
  showBadge = false
}) => {
  const normalizedType = 
    type === 'crack' ? 'longitudinal_crack' :
    type === 'manhole' || type === 'manhole_depression' ? 'manhole_hazard' :
    type;

  const clipId = `road-circle-clip-${normalizedType}`;

  const getImageSource = () => {
    switch (normalizedType) {
      case 'transverse_crack':
        return DEFECT_TRANSVERSE_CRACK_IMG;
      case 'alligator_crack':
        return DEFECT_ALLIGATOR_CRACK_IMG;
      case 'longitudinal_crack':
        return DEFECT_LONGITUDINAL_CRACK_IMG;
      case 'pothole':
        return DEFECT_POTHOLE_IMG;
      case 'manhole_hazard':
      case 'other':
      default:
        return DEFECT_MANHOLE_HAZARD_IMG;
    }
  };

  const imageSrc = getImageSource();

  const getDefectName = () => {
    switch (normalizedType) {
      case 'transverse_crack':
        return 'Transverse Crack';
      case 'alligator_crack':
        return 'Alligator Crack';
      case 'longitudinal_crack':
        return 'Longitudinal Crack';
      case 'pothole':
        return 'Pothole';
      case 'manhole_hazard':
      case 'other':
      default:
        return 'Manhole Hazard';
    }
  };

  return (
    <div className={`relative inline-flex flex-col items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={title || normalizedType}
      >
        <defs>
          <clipPath id={clipId}>
            <circle cx="60" cy="60" r="54" />
          </clipPath>
        </defs>

        <g clipPath={`url(#${clipId})`}>
          <image
            href={imageSrc}
            x="0"
            y="0"
            width="120"
            height="120"
            preserveAspectRatio="xMidYMid slice"
          />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="rgba(0,0,0,0.15)"
            strokeWidth="4"
          />
        </g>

        {/* Deep Blue Circular Frame */}
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="#0A3669"
          strokeWidth="6"
        />
        {/* Inner Subtle Ring */}
        <circle
          cx="60"
          cy="60"
          r="51"
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1"
        />
      </svg>

      {showBadge && (
        <div className="absolute -bottom-2 bg-[#092D57] text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap flex items-center gap-1 border border-white/20">
          <span>{getDefectName()}</span>
        </div>
      )}
    </div>
  );
};
