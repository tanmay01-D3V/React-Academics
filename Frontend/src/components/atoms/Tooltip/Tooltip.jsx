import React, { useState } from 'react';
import './Tooltip.css';

const Tooltip = ({ children, content, position = 'top' }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="tooltip"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className={`tooltip__content tooltip__content--${position}`}>
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;