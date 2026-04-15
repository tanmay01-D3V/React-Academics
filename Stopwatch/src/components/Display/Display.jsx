import React from 'react';

const Display = ({ time }) => {
  const formatTime = (time) => {
    const minutes = String(Math.floor((time / 60) % 60)).padStart(2, '0');
    const seconds = String(Math.floor(time % 60)).padStart(2, '0');
    const milliseconds = String((time % 1).toFixed(3).slice(2)).padEnd(3, '0');
    return `${minutes}:${seconds}.${milliseconds}`;
  };

  return (
    <div className="display">
      <h1>{formatTime(time)}</h1>
    </div>
  );
};

export default Display;