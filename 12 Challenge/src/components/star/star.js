
import React from 'react';
import './star.css';


const Star = ({ filled = true, size, color  = "#0ff" }) => {
  // SVG-путь для пятиконечной звезды (масштабирован под viewBox 20x20)
  const starPath = "M10 0 L12.36 6.36 L19.02 6.36 L13.82 10.24 L16.18 16.6 L10 12.8 L3.82 16.6 L6.18 10.24 L1 6.36 L7.64 6.36 Z";

  return (
    <svg className='star'
      width={size} 
      height={size} 
      viewBox="0 0 20 20"
      style={{
        filter: filled ? `drop-shadow(0 0 2px ${color})` : 'none',
        opacity: filled ? 1 : 0.3,
        transition: 'all 0.3s ease',
      }}
    >
      <path 
        d={starPath} 
        fill={filled ? color : "transparent"} 
        stroke={color} 
        strokeWidth="0.5"
      />
    </svg>
  );
};

export default Star;
