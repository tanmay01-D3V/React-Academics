import React from 'react';
import './Loader.css';

const Loader = ({ size = 'medium' }) => {
  return (
    <div className={`loader loader--${size}`}>
      <div className="loader__spinner"></div>
    </div>
  );
};

export default Loader;