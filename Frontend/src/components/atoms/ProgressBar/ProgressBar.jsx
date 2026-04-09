import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ value, max = 100, color = '#007bff' }) => {
  const percentage = (value / max) * 100;
  return (
    <div className="progress-bar">
      <div
        className="progress-bar__fill"
        style={{ width: `${percentage}%`, backgroundColor: color }}
      ></div>
    </div>
  );
};

export default ProgressBar;