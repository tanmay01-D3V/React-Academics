import React from 'react';

const Laps = ({ laps }) => {
  return (
    <div className="laps">
      <h2>Lap Times</h2>
      <ul>
        {laps.map((lap, index) => (
          <li key={index}>{lap}</li>
        ))}
      </ul>
    </div>
  );
};

export default Laps;