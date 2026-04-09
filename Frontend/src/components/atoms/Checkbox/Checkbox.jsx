import React from 'react';
import './Checkbox.css';

const Checkbox = ({ label, checked, onChange, disabled = false }) => {
  return (
    <label className="checkbox">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="checkbox__input"
      />
      <span className="checkbox__checkmark"></span>
      {label}
    </label>
  );
};

export default Checkbox;