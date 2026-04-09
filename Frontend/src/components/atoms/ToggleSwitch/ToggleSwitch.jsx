import React from 'react';
import './ToggleSwitch.css';

const ToggleSwitch = ({ checked, onChange, disabled = false }) => {
  return (
    <label className="toggle-switch">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="toggle-switch__input"
      />
      <span className="toggle-switch__slider"></span>
    </label>
  );
};

export default ToggleSwitch;