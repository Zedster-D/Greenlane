import React from 'react';

interface QualityBadgeProps {
  quality: string;
  className?: string;
}

export const QualityBadge: React.FC<QualityBadgeProps> = ({ quality, className = '' }) => {
  const q = quality.toUpperCase();
  
  if (q === 'MEASURED') {
    return (
      <span 
        title="Direct measurement (carrier telematics / fuel logs / weighbridge)"
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
        MEASURED
      </span>
    );
  } else if (q === 'ESTIMATED') {
    return (
      <span 
        title="Calculated via distance × standard emission factors (ADEME / GLEC)"
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-1.5"></span>
        ESTIMATED
      </span>
    );
  } else {
    return (
      <span 
        title="Proxy estimate or default industry baseline"
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5"></span>
        ASSUMED
      </span>
    );
  }
};
