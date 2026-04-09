import React from 'react';
import './IconButton.css';

const IconButton = ({ icon, onClick, size = 'medium', disabled = false }) => {
  return (
    <button
      className={`icon-button icon-button--${size}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
    </button>
  );
};

export default IconButton;