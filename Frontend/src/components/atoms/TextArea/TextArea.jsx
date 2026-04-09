import React from 'react';
import './TextArea.css';

const TextArea = ({ placeholder, value, onChange, rows = 4, disabled = false }) => {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      disabled={disabled}
      className="text-area"
    />
  );
};

export default TextArea;