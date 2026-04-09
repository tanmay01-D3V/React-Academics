import React from 'react';
import './Divider.css';

const Divider = ({ orientation = 'horizontal', thickness = '1px', color = '#e9ecef' }) => {
  return (
    <div
      className={`divider divider--${orientation}`}
      style={{ borderColor: color, borderWidth: thickness }}
    ></div>
  );
};

export default Divider;