import React from 'react';

const Controls = ({ onStart, onStop, onReset }) => {
  return (
    <div className="controls">
      <button onClick={onStart}>Start</button>
      <button onClick={onStop}>Stop</button>
      <button onClick={onReset}>Reset</button>
    </div>
  );
};

export default Controls;