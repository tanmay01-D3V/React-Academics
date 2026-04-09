import React from 'react';
import './Button.css';

const Button = ({ children, onClick, variant = 'primary', size = 'medium', disabled = false }) => {
  return (
    <button
      className={`button button--${variant} button--${size}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;