import React from 'react';
import './InputField.css';

const InputField = ({ type = 'text', placeholder, value, onChange, disabled = false }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="input-field"
    />
  );
};

export default InputField;