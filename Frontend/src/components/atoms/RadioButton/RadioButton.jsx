import React from 'react';
import './RadioButton.css';

const RadioButton = ({ label, name, value, checked, onChange, disabled = false }) => {
  return (
    <label className="radio-button">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="radio-button__input"
      />
      <span className="radio-button__checkmark"></span>
      {label}
    </label>
  );
};

export default RadioButton;